# Design

## Context

The backend exposes authenticated product mutations through `ProductController` and persists them through `ProductService`. The frontend has no WebSocket client and keeps product collections and the selected product in Angular Signals owned by `ProductService`; the repository does not currently use NgRx. The API runs under the `/api` servlet context, and JWTs are currently supplied through HTTP authorization interceptors.

## Goals / Non-Goals

**Goals:**

- Deliver authenticated product create, update, and delete events to connected clients.
- Ensure an event is sent only after the product mutation has committed successfully.
- Preserve the existing REST contracts while making event application safe when HTTP and WebSocket responses arrive in either order.
- Keep product state centralized in the existing Signals-based `ProductService`.
- Recover automatically from transient connection failures and handle deletion of the actively viewed product.

**Non-Goals:**

- Introducing NgRx or migrating existing product state to a store.
- Broadcasting inventory/stock changes that do not pass through the product mutation endpoints.
- Replacing the existing REST API with WebSockets.
- Providing replay or durable event history across long offline periods.

## Decisions

### Use STOMP over a brokered Spring WebSocket endpoint

Add Spring WebSocket support with a STOMP endpoint at `/ws` and a topic at `/topic/products`. The servlet context makes the effective endpoint `/api/ws`; the Angular client derives the `ws` or `wss` URL from `EnvironmentConfig.apiUrl`.

STOMP is preferred over a raw WebSocket handler because it supplies explicit subscriptions, typed destinations, reconnect hooks, and a standard client protocol. SockJS is not required unless a deployment environment proves unable to support native WebSockets.

### Authenticate the STOMP session with the existing JWT

The HTTP handshake is allowed to reach the WebSocket endpoint, but product event access is authorized during the STOMP `CONNECT` frame. The Angular client sends the existing JWT as a STOMP connect header. A Spring message-channel interceptor validates that token using the existing JWT service and places the authenticated principal on the message. Invalid or missing credentials are rejected before the product topic subscription can receive data.

This avoids putting credentials in a URL query string and preserves the existing authenticated API boundary. WebSocket endpoint origin checks reuse the configured CORS origins.

### Publish after the database commit

Keep event broadcasting at the controller boundary requested by the story, but make the service mutation methods transactional. The controller calls the service first and invokes `SimpMessagingTemplate.convertAndSend` only after that method returns successfully, which means the service transaction has committed. The controller publishes:

- `CREATED` with the mapped `ProductResponseDto`.
- `UPDATED` with the mapped `ProductResponseDto`.
- `DELETED` with the UUID and no product body.

Validation occurs before the controller method body for invalid request DTOs, and service exceptions prevent the broadcast call. The event broker is not part of the database transaction; a broker failure cannot roll back an already committed product change. Clients retain HTTP loading/retry as the recovery path.

If publication later needs to be shared by non-controller mutation paths, the same event model can be moved to a transaction-bound application event listener without changing the wire contract.

### Standardize event identity and ordering metadata

Use a payload equivalent to:

```json
{
  "eventId": "uuid",
  "action": "CREATED | UPDATED | DELETED",
  "productId": "uuid",
  "occurredAt": "2026-11-06T13:44:41.790Z",
  "product": {}
}
```

`product` is present for create/update and null for delete. `eventId` supports duplicate detection. `occurredAt` is generated when the successful mutation is published and is used as the event watermark for a product. The DTO remains the existing product response shape, avoiding an unrelated REST contract change.

The client uses an idempotent upsert/remove reducer:

- Create inserts only when the ID is absent.
- Update replaces the matching ID and does not append duplicates.
- Delete removes all matching entries and clears the selected product when applicable.
- Repeated event IDs and older event timestamps are ignored.

The HTTP mutation response continues to update the initiating client as it does today. Because the response and event describe the same committed mutation, applying either first converges to one representation. The reducer must replace rather than append and must not let an already-applied event create a second product. Event timestamps additionally prevent out-of-order WebSocket messages from regressing state.

### Isolate transport from product state

Add a singleton Angular `ProductWebSocketService` that owns STOMP activation, authentication headers, subscription, parsing, connection status, and reconnect scheduling. It exposes a typed observable of product events. `ProductService` subscribes once through its singleton lifecycle and is the only service that mutates product Signals.

Start the stream from the authenticated root/product-state lifecycle rather than from each lazy product page, preventing duplicate subscriptions during route changes. Stop it on logout and when the application is destroyed. The mock environment does not connect to a real endpoint unless an explicit mock transport is added.

### Use bounded exponential backoff

Reconnect after unexpected disconnects with one scheduled attempt at a time:

- Initial delay: 1 second.
- Backoff multiplier: 2.
- Maximum delay: 30 seconds.
- Add bounded random jitter to avoid synchronized browser reconnects.
- Reset the attempt counter after a successful authenticated subscription.
- Cancel pending timers on logout or explicit deactivation.

This gives quick recovery for short outages while preventing a large number of clients from creating a reconnect storm. A connection-status signal can expose `connected`, `reconnecting`, and `disconnected` states without making connection status part of product data.

### Handle active detail views in the component/router layer

`ProductService` clears the selected product when a matching delete event arrives. `ProductDetailPageComponent` observes the selected-product transition for the route’s product ID, calls `NotificationsService` with a product-unavailable message, and navigates to the existing catalog route. The existing authenticated route guard remains responsible for access; no new guard is needed because deletion is a domain-state transition, not an authorization transition.

## Risks / Trade-offs

- **[Broker publication fails after commit]** -> Do not fake a successful rollback; keep the REST response successful and rely on the next catalogue load/retry. Add logging and integration coverage for the publication boundary.
- **[Clients miss events while offline]** -> Events are not durable in this change. Reconnect restores the subscription, and normal initial loads/retry actions provide resynchronization.
- **[JWT expires while a socket is open]** -> Reject or close the STOMP session when authentication is no longer valid; the client must obtain the current token before reconnecting and must not reconnect after logout.
- **[HTTP response and event are received in different orders]** -> Use ID-based idempotent reducers, event IDs, and event timestamps; never append blindly.
- **[Multiple browser tabs create duplicate subscriptions]** -> Keep one subscription per Angular application instance. Cross-tab connection sharing is out of scope.
- **[Current product DTO has no availability field]** -> Limit this change to fields represented by the existing product endpoints. Stock/inventory events require a separate capability.

## Migration Plan

1. Deploy the backend WebSocket dependency, endpoint, JWT message authentication, event contract, and post-commit controller publication alongside the existing REST endpoints.
2. Deploy the frontend client and Signal reducer; existing HTTP catalogue/detail loading remains the initial-state and recovery path.
3. Validate authenticated create/update/delete flows with two browser sessions, reconnect behavior, and deletion from the detail route.
4. Roll back by removing or disabling the frontend subscription first, then the backend WebSocket configuration/publication. REST product operations remain usable throughout rollback.
