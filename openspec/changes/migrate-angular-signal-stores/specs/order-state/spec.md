# Spec Delta

## Purpose

Provides shared order history, order detail, and order creation state while preserving authenticated API access, read-operation error behavior, mutation error propagation, and immediate order-list updates after creation.

## ADDED Requirements

### Requirement: Order state is shared across order consumers

Order overview, detail, and checkout consumers SHALL observe one consistent order collection and selected-order state with explicit loading and error status.

#### Scenario: Order list and checkout share state

- **WHEN** order history loads and checkout creates a new order
- **THEN** the order history and checkout observe the same order collection, with the created order available at the beginning of the collection after success

### Requirement: Order reads preserve retrieval behavior

Order list and detail reads SHALL use the existing authenticated endpoints and expose loading/error state while preserving the existing read-operation error handling and selected-record clearing.

#### Scenario: Order list loads successfully

- **WHEN** `GET /orders` returns orders
- **THEN** the shared order collection is replaced with the response and list loading/error state indicates success

#### Scenario: Order detail loads successfully

- **WHEN** `GET /orders/{id}` returns an order
- **THEN** the selected order is replaced with the response and detail loading/error state indicates success

#### Scenario: Order list read fails

- **WHEN** `GET /orders` returns an HTTP error
- **THEN** the collection error is exposed, loading completes, and the read operation preserves the existing success-shaped error handling

#### Scenario: Order detail read fails

- **WHEN** `GET /orders/{id}` returns an HTTP error
- **THEN** the selected order is cleared, the detail error is exposed, loading completes, and the read operation preserves the existing success-shaped error handling

### Requirement: Order creation preserves payload and list update behavior

Order creation SHALL submit the existing items and address payload to `POST /orders`, return the created order, prepend it to the shared order collection, and propagate HTTP errors.

#### Scenario: Order creation succeeds

- **WHEN** `POST /orders` returns a created order
- **THEN** the created order is prepended to the order collection and returned to the caller

#### Scenario: Order creation fails

- **WHEN** `POST /orders` returns an HTTP error
- **THEN** the error propagates to the caller and the order collection is not updated as if creation succeeded

### Requirement: Order requests preserve authenticated and mock boundaries

Order operations SHALL continue to use the configured API URL, existing DTO shapes, auth header behavior, and mock order handlers.

#### Scenario: Authenticated order request is sent

- **WHEN** an order read or creation operation runs with an available token
- **THEN** the existing HTTP interceptor supplies the authorization header and the request reaches the configured `/orders` endpoint

#### Scenario: Mock order creation is used

- **WHEN** order creation runs in the mock environment
- **THEN** the existing mock handler receives the submitted address and items and returns through the normal HTTP client boundary

