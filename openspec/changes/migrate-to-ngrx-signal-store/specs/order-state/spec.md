# Spec Delta

## Purpose

Provides authenticated order list, detail, and creation state for order history and checkout while preserving existing API payloads, mock behavior, error contracts, and cart coordination.

## ADDED Requirements

### Requirement: Order state is shared across order consumers
The system SHALL expose one shared order state to the order overview, order detail, and checkout consumers.

#### Scenario: Consumers observe created orders
- **WHEN** checkout creates an order and the overview is subsequently displayed
- **THEN** the overview can observe the created order through shared order state

#### Scenario: Lazy order routes reuse state
- **WHEN** an order lazy route is activated
- **THEN** it uses the existing application order state rather than a duplicate route-scoped owner

### Requirement: Order list retrieval preserves behavior
The system SHALL retrieve authenticated orders through the existing API contract with independent list loading/error state and the current read-failure fallback behavior.

#### Scenario: Order list loads
- **WHEN** the authenticated order list request succeeds
- **THEN** orders are stored, list loading ends, and list error is empty

#### Scenario: Order list fails
- **WHEN** the order list request fails
- **THEN** list error is recorded, loading ends, and the existing success-shaped read fallback is returned

### Requirement: Order detail retrieval preserves behavior
The system SHALL retrieve an authenticated order detail through the existing API contract and SHALL clear the selected order when the request cannot provide a valid record.

#### Scenario: Order detail loads
- **WHEN** an order detail request succeeds
- **THEN** the selected order is stored and detail loading ends

#### Scenario: Order detail fails
- **WHEN** an order detail request fails
- **THEN** detail error is recorded, the selected order is cleared as before, and the existing read fallback is returned

### Requirement: Order creation propagates errors and updates state
The system SHALL create orders using existing authenticated request payloads, propagate creation failures, and make successful created orders available in order state.

#### Scenario: Order creation succeeds
- **WHEN** an authenticated order creation request succeeds
- **THEN** the created order is prepended or otherwise reflected according to the existing list-update behavior and the operation completes successfully

#### Scenario: Order creation fails
- **WHEN** the backend rejects order creation
- **THEN** the HTTP error reaches the checkout caller and order state records the relevant error

### Requirement: Order requests retain authentication and mock compatibility
The system SHALL preserve the existing authorization-header, configured URL, HTTP method, request-body, and mock-interceptor behavior for order operations.

#### Scenario: Authenticated order request is sent
- **WHEN** an order list, detail, or create operation is invoked with an authenticated session
- **THEN** the request uses the existing endpoint and receives the existing auth interceptor behavior

#### Scenario: Mock mode handles an order request
- **WHEN** the frontend runs with the mock environment
- **THEN** order operations remain compatible with the existing mock handler responses and simulated timing
