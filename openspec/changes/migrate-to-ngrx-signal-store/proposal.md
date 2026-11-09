# Proposal

## Why

The Angular frontend currently keeps authentication, catalogue, cart, and order state in injectable services backed by ad-hoc writable signals. Migrating these four state domains to NgRx SignalStore will establish explicit typed state contracts, centralized derived state and side effects, and independently testable workflows without changing the existing API, browser-storage, authentication, cart, checkout, or order behavior.

The migration should be incremental because the application is a standalone Angular 21 SPA with lazy-loaded feature routes and no NgRx dependency today. Each store must become the single mutable owner for its feature before the next feature is migrated.

## What Changes

- Add and configure an Angular 21/RxJS 7-compatible `@ngrx/signals` dependency after verifying peer compatibility; the planned version is `21.0.1`.
- Create four root-provided singleton stores:
  - `AuthStore`
  - `ProductStore`
  - `CartStore`
  - `OrderStore`
- Define explicit TypeScript state interfaces for every store, including feature data, loading state, and error state.
- Use `withState` for state definitions, `withComputed` for reusable derived state, and `withMethods` for mutations and business operations.
- Use `rxMethod` for reactive asynchronous HTTP/profile workflows where RxJS composition is appropriate; retain synchronous store methods for cart mutations, token clearing, role checks, and persistence.
- Keep HTTP communication in reusable typed API/data services and preserve the existing REST endpoints, DTOs, configured API URLs, functional interceptors, and mock interceptor boundary.
- Move state-related side effects, including token/profile hydration and cart persistence, into store methods.
- Migrate components and application infrastructure to inject stores directly, including app initialization, the auth interceptor, guards, role directive, navbar, product pages, cart flows, checkout, and order pages.
- Preserve `access_token` and `cart_state` storage keys, the existing cart JSON shape, malformed/invalid cart handling, synchronous token access, authentication and role behavior, read fallback contracts, mutation error propagation, and clear-cart-only-after-success checkout behavior.
- Convert migrated services into delegating compatibility facades or stateless HTTP/data boundaries, or remove them only after all consumers and compatibility contracts are verified. No migrated service may retain duplicated mutable signal state.
- Add focused store tests and update existing service, component, guard, interceptor, directive, mock-handler, storage, and checkout tests with a regression gate after each feature.
- Keep `SupplierService`, `ThemeService`, `NotificationsService`, backend code, routes, endpoints, DTOs, and unrelated form/presentation state outside this migration.

No externally observable breaking API, route, storage, or backend change is intended. Internal service-to-store dependency-injection changes are compatibility-sensitive and must be covered by tests.

## Capabilities

### New Capabilities

- `auth-state`: JWT token persistence, profile hydration, authentication and role derivation, and auth-boundary integration.
- `product-catalogue-state`: Product/category retrieval and CRUD state with independent resource loading/error behavior.
- `cart-state`: Browser-persisted cart state, validation, quantity mutations, calculations, and checkout handoff semantics.
- `order-state`: Authenticated order list/detail retrieval and order creation state with preserved error/loading behavior.

### Modified Capabilities

None. The repository has no existing capability specifications; these four contracts describe the behavior currently implemented by the frontend services and their consumers.

## Impact

- **Dependencies:** `onlineshopui/package.json` and `package-lock.json` gain `@ngrx/signals@21.0.1` during implementation.
- **New frontend code:** four store files and focused store tests under the corresponding feature directories.
- **Application wiring:** `app.config.ts`, auth interceptor, guards, role directive, and navbar use `AuthStore`.
- **Feature consumers:** authentication, product, cart, checkout, and order pages inject their stores directly.
- **Existing services:** `AuthService`, `ProductService`, `CartService`, and `OrdersService` lose independent mutable state after their feature cutovers and become facades/stateless boundaries or are removed when demonstrably unused.
- **HTTP/API:** no endpoint, payload, DTO, authorization, mock-handler, or backend behavior changes.
- **Browser contracts:** `access_token`, `cart_state`, cart serialization, invalid-entry filtering, and checkout retention/clear semantics remain compatible.
- **Out of scope:** supplier, theme, notification, backend, routing, and component-local presentation/form state.
