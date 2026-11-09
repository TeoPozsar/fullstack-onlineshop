# Proposal

## Why

Product changes made by administrators are currently visible to other customers only after a manual refresh. This change adds authenticated, resilient real-time product events so catalog and detail views remain current without requiring users to reload the page.

## What Changes

- Add an authenticated STOMP-over-WebSockets endpoint to the Spring Boot API.
- Publish standardized product-created, product-updated, and product-deleted events only after the corresponding database transaction commits successfully.
- Integrate an Angular WebSocket client with the existing Signals-based `ProductService` state.
- Make client event application idempotent so HTTP responses and WebSocket events can arrive in either order without duplicate or stale product state.
- Add automatic reconnect with exponential backoff and connection lifecycle handling for authenticated sessions.
- Update product detail behavior when its product is deleted: notify the user and navigate to the product catalog.
- Add backend and frontend tests for event publication, failed mutations, event ordering, reconnection, and active-detail-page behavior.
- Keep the implementation Signals-only; this repository currently has no NgRx dependency or product store.

## Capabilities

### New Capabilities

- `realtime-product-updates`: Authenticated real-time product change delivery and client-side catalogue/detail synchronization.

### Modified Capabilities

None.

## Impact

- Backend dependencies and configuration: Spring WebSocket/STOMP support, WebSocket security/JWT message authentication, endpoint origin configuration, and product event publishing.
- Backend product API: successful create, update, and delete operations will broadcast events without changing their existing HTTP response contracts.
- Frontend dependencies and services: STOMP client dependency, WebSocket transport service, environment URL handling, and `ProductService` signal updates.
- Frontend product pages: live catalog updates and deletion notification/redirect behavior on the detail page.
- Tests: `ProductController`/WebSocket security coverage and Angular service/component coverage.
