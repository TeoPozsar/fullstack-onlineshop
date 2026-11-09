# Tasks

## 1. Backend WebSocket foundation

- [x] 1.1 Add the Spring WebSocket/STOMP dependency and configure the `/ws` endpoint, `/topic/products` broker destination, allowed origins, and `/api` context-path compatibility; verify the backend compiles with the new configuration.
- [x] 1.2 Define the product event DTO with `eventId`, `action`, `productId`, `occurredAt`, and nullable product response data; verify JSON serialization matches the documented create, update, and delete payloads.
- [x] 1.3 Add STOMP message authentication using the existing JWT service and a channel interceptor; verify valid JWT sessions can subscribe and invalid or missing JWT sessions are rejected.

## 2. Backend event publication

- [x] 2.1 Make product create, update, and delete persistence operations transactional and publish `CREATED`, `UPDATED`, and `DELETED` events from the successful controller paths after the service transaction returns; verify event publication receives the persisted DTO or deleted ID.
- [x] 2.2 Ensure validation, authorization, not-found, persistence, and product-in-order failures bypass event publication; verify controller tests assert the messaging template is not called for each failure category.
- [x] 2.3 Add backend tests for event action, product ID, timestamp, payload shape, and post-commit publication behavior; verify the targeted Maven controller/WebSocket test suite passes.

## 3. Frontend WebSocket transport

- [x] 3.1 Add the Angular STOMP client dependency and define typed product event models; verify dependency installation and TypeScript compilation succeed.
- [x] 3.2 Implement the singleton `ProductWebSocketService` with environment-derived `ws`/`wss` URL construction, JWT STOMP connect headers, product-topic subscription, typed event output, and lifecycle activation/deactivation; verify service tests cover connect, subscribe, parse, and logout cleanup.
- [x] 3.3 Implement reconnect scheduling with one active attempt, 1-second initial delay, exponential factor 2, bounded 30-second delay, jitter, reset after successful subscription, and cancellation on logout; verify tests cover dropped connections, restored subscriptions, and cancelled retries.

## 4. Signal state and page integration

- [x] 4.1 Integrate `ProductWebSocketService` into the singleton `ProductService` state flow without adding NgRx; verify product service tests cover create upsert, update replacement, delete removal, selected-product clearing, duplicate events, and stale event timestamps.
- [x] 4.2 Make HTTP mutation response handling and WebSocket event handling order-safe and idempotent; verify tests cover an update event before its HTTP response, the reverse order, and repeated delivery without duplicate products.
- [x] 4.3 Start and stop the product stream with the authenticated application lifecycle and avoid duplicate subscriptions across lazy product routes; verify lifecycle tests show one active subscription per application instance and no subscription after logout.
- [x] 4.4 Update `ProductDetailPageComponent` to observe deletion of its active product, notify through `NotificationsService`, and navigate to the existing catalog route; verify component tests assert the notification and router navigation.
- [x] 4.5 Preserve initial HTTP loading and define mock-environment behavior without opening a real WebSocket; verify mock-mode tests/build remain passing.

## 5. Documentation and integration verification

- [x] 5.1 Update the maintained architecture/API documentation with the authenticated WebSocket endpoint, topic, event contract, JWT handshake behavior, and Signals integration; verify documented URLs match environment configuration and implementation.
- [x] 5.2 Run backend and frontend lint, type-check/build, and focused unit tests; verify all targeted checks pass without changing existing REST response contracts.
- [ ] 5.3 Exercise the acceptance flow with two authenticated browser sessions: create, update, and delete propagation, live detail update, deleted-detail notification/redirect, reconnect recovery, and failed mutation without an event; record observed outcomes in the implementation handoff.
