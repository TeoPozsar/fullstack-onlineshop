# Spec Delta

## Purpose

Provides authenticated, real-time propagation of successful product catalogue changes so connected customers see creates, updates, and deletes without manually refreshing their browser.

## ADDED Requirements

### Requirement: Product mutations publish committed events

The system SHALL publish a standardized event for each successfully committed product creation, update, or deletion, and SHALL NOT publish an event when validation, authorization, persistence, or business-rule processing fails.

#### Scenario: Successful product creation is published

- **WHEN** an authorized administrator creates a product and the database transaction commits
- **THEN** all subscribed clients receive a `CREATED` event containing the persisted product DTO, product ID, and event timestamp

#### Scenario: Successful product update is published

- **WHEN** an authorized administrator updates a product and the database transaction commits
- **THEN** all subscribed clients receive an `UPDATED` event containing the persisted product DTO, product ID, and event timestamp

#### Scenario: Successful product deletion is published

- **WHEN** an authorized administrator deletes a product and the database transaction commits
- **THEN** all subscribed clients receive a `DELETED` event containing the deleted product ID and event timestamp

#### Scenario: Failed mutation is not published

- **WHEN** a product mutation fails validation, authorization, persistence, not-found, or business-rule processing
- **THEN** no product-change event is delivered for that mutation

### Requirement: Product events use a stable message contract

Each product event SHALL identify its action, product ID, event timestamp, and product DTO when the action is `CREATED` or `UPDATED`; a delete event SHALL omit the product DTO or represent it as null.

#### Scenario: Client receives a create or update payload

- **WHEN** a client receives a `CREATED` or `UPDATED` product event
- **THEN** the payload contains an action type, an ISO-8601 timestamp, the product ID, and the complete product response representation

#### Scenario: Client receives a delete payload

- **WHEN** a client receives a `DELETED` product event
- **THEN** the payload contains an action type, an ISO-8601 timestamp, and the product ID without requiring a product DTO

### Requirement: Product event delivery is authenticated

The WebSocket connection and product event subscription SHALL require a valid existing JWT authentication context, and unauthenticated or invalidly authenticated clients SHALL NOT receive product events.

#### Scenario: Authenticated client subscribes

- **WHEN** a client establishes a WebSocket session and authenticates using a valid JWT
- **THEN** the client can subscribe to the product event stream and receive product events

#### Scenario: Unauthenticated client connects

- **WHEN** a client attempts to establish or authenticate a product WebSocket session without a valid JWT
- **THEN** the session or product subscription is rejected and no product events are delivered

### Requirement: Connected catalogues converge without refresh

A connected product catalogue SHALL apply received create, update, and delete events to its visible product collection without requiring an HTTP refresh.

#### Scenario: Product creation appears in another catalogue

- **WHEN** a product is successfully created in one session while another session is viewing the catalogue
- **THEN** the other session adds the created product to its visible collection

#### Scenario: Product update appears in another catalogue

- **WHEN** a product is successfully updated in one session while another session is viewing the catalogue
- **THEN** the other session replaces the matching product with the received persisted representation

#### Scenario: Product deletion appears in another catalogue

- **WHEN** a product is successfully deleted in one session while another session is viewing the catalogue
- **THEN** the other session removes the matching product from its visible collection

### Requirement: Event application is order-safe and idempotent

The client SHALL apply product events idempotently and SHALL converge to the newest known product representation when a WebSocket event and the originating HTTP mutation response arrive in either order.

#### Scenario: Update event arrives before HTTP response

- **WHEN** an `UPDATED` event for a product is applied before the originating HTTP `PUT` response resolves
- **THEN** the later HTTP response does not overwrite the event with stale data or produce an additional product entry

#### Scenario: HTTP response arrives before update event

- **WHEN** the originating HTTP mutation response updates local state before its broadcast event arrives
- **THEN** applying the event leaves one product entry with the same persisted representation

#### Scenario: Duplicate event is received

- **WHEN** the client receives the same create, update, or delete event more than once
- **THEN** applying the duplicate does not create duplicate products or otherwise corrupt collection or selected-product state

### Requirement: Active product details remain synchronized

The product detail view SHALL replace its displayed product when an update event targets that product and SHALL notify and redirect when a delete event targets it.

#### Scenario: Displayed product is updated

- **WHEN** an `UPDATED` event targets the product currently displayed in the detail view
- **THEN** the detail view immediately renders the received product representation

#### Scenario: Displayed product is deleted

- **WHEN** a `DELETED` event targets the product currently displayed in the detail view
- **THEN** the client shows a product-unavailable notification and navigates to the product catalogue route

### Requirement: WebSocket clients recover from connection loss

The client SHALL automatically attempt to reconnect after an unexpected WebSocket disconnect using exponential backoff, SHALL avoid concurrent reconnect attempts, and SHALL restore the product subscription after reconnection.

#### Scenario: Connection drops

- **WHEN** an established product WebSocket connection drops unexpectedly
- **THEN** the client retries with exponentially increasing delays, bounded by a configured maximum delay, until the connection is restored or the authenticated session ends

#### Scenario: Connection is restored

- **WHEN** a reconnect attempt succeeds
- **THEN** the client re-authenticates, resubscribes to product events, and resets the backoff for future failures

#### Scenario: User logs out during reconnect

- **WHEN** the authenticated session ends while reconnect attempts are pending
- **THEN** the client cancels pending reconnect work and does not establish a new product subscription
