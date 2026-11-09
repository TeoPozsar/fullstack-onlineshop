# Proposal

## Why

The Angular frontend currently keeps authentication, catalogue, cart, and order state in separate injectable services backed by ad hoc writable signals. Migrating to four independent NgRx SignalStores will give each feature an explicit state contract, predictable derived state, and testable reactive HTTP workflows while preserving the existing API, browser storage, authentication, cart, checkout, and error behavior.

The migration is timely because the frontend has no existing NgRx dependency, so the boundaries can be established before more consumers or state behaviors accumulate. It will be incremental and behavior-preserving: existing services may remain during transition, but after a feature cutover they must delegate to its store or be removed if no longer required, never remaining a second mutable state owner.

## What Changes

- Add an Angular 21-compatible `@ngrx/signals` dependency after verifying official compatibility information.
- Establish four independent feature stores:
  - `AuthStore`
  - `ProductStore`
  - `CartStore`
  - `OrderStore`
- Provide every store at root level by default, with one singleton instance per feature and no duplicate instances in lazy-loaded routes.
- Give every store an explicit state interface containing feature state plus loading and error properties; use resource-specific loading for concurrent requests and `withComputed` for derived feature state.
- Use `rxMethod` for asynchronous HTTP/profile workflows where reactive RxJS composition adds value, and regular store methods for synchronous mutations such as cart changes, logout state clearing, and storage persistence.
- Migrate all current consumers, app initialization, guards, role directive, navbar, and auth interceptor to the corresponding stores without parallel mutable state.
- Keep `SupplierService`, `ThemeService`, and `NotificationsService` outside this migration.
- Keep existing API services/HTTP boundaries where appropriate and preserve development, production, and mock interceptor behavior.
- Preserve `access_token` and `cart_state` storage keys, existing serialized cart shape, invalid-entry handling, profile hydration, synchronous token reads, role checks, route guards, and app initialization.
- Preserve read-operation error contracts and mutation error propagation contracts.
- Preserve checkout atomicity: clear the cart only after successful order creation; retain it after failed checkout.
- Add store-focused unit tests and update existing consumer, guard, interceptor, directive, mock-handler, and component tests.
- Gate each feature before starting the next feature with its focused and existing regression tests.

No externally observable breaking API or route change is intended. Any internal service-to-store contract changes that affect tests or dependency injection are implementation changes and must be covered by the migration test suite.

## Capabilities

### New Capabilities

- `auth-state`: JWT token persistence, profile hydration, authentication/role derivation, and auth-boundary integration.
- `product-catalogue-state`: Product/category retrieval and CRUD state with explicit resource loading/error behavior.
- `cart-state`: Browser-persisted cart state, quantity calculations, synchronous mutations, and checkout handoff semantics.
- `order-state`: Order list/detail retrieval and order creation state with preserved error/loading behavior.

### Modified Capabilities

None. The repository has no existing capability specifications; these are new behavioral contracts derived from the implemented frontend behavior.

## Impact

- **Frontend dependencies:** `onlineshopui/package.json` and `package-lock.json` gain a compatible `@ngrx/signals` version only during implementation.
- **Application wiring:** `src/app/app.config.ts`, auth interceptor, guards, role directive, and shared navbar use `AuthStore`.
- **Feature consumers:** product, cart, auth, and order pages use their feature stores.
- **New code:** four store files and focused store tests under the corresponding feature directories.
- **Existing services:** retained temporarily for compatibility and HTTP-boundary continuity, then delegated to stores or removed only when no longer required; they must not own parallel mutable state after cutover.
- **Tests:** existing Vitest/TestBed/http-testing tests are updated and expanded; no end-to-end tooling is introduced.
- **Backend/API:** no endpoint, DTO, persistence, authorization, or backend behavior changes.
- **Browser contracts:** `access_token`, `cart_state`, cart JSON serialization, and checkout behavior remain compatible.
