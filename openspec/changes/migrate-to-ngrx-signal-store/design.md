# Design

## Context

The frontend is an Angular 21.2 standalone SPA using RxJS 7.8, lazy-loaded feature routes, functional HTTP interceptors, typed services, browser-local cart persistence, and a mock HTTP interceptor. `AuthService`, `ProductService`, `CartService`, and `OrdersService` currently combine writable signal state with HTTP or storage side effects. See `proposal.md` and the four capability specifications for the behavior to preserve.

The application has no NgRx dependency. Official package metadata identifies `@ngrx/signals@21.0.1` as compatible with Angular 21 and RxJS 7.8. The backend remains a stateless REST API and is not part of this migration.

## Goals / Non-Goals

**Goals:**

- Establish four explicitly typed, root-provided SignalStores with one mutable state owner per feature.
- Use `withState`, `withComputed`, and `withMethods` consistently, with `rxMethod` only for asynchronous workflows that benefit from RxJS composition.
- Preserve existing HTTP/data-service boundaries, request contracts, browser storage, auth integration, cart calculations, checkout atomicity, and read/mutation error semantics.
- Migrate consumers incrementally with focused tests and regression gates.
- Keep compatibility facades or stateless data services until all consumers are safely migrated.

**Non-Goals:**

- Do not migrate supplier, theme, notification, backend, routing, form, or component-local presentation state.
- Do not introduce global reducers, actions, effects, or a monolithic application store.
- Do not change API endpoints, DTOs, storage keys/formats, authorization semantics, or route URLs.
- Do not run implementation or dependency installation as part of this planning change.

## Decisions

### 1. Four independent root-level stores

Define `AuthStore`, `ProductStore`, `CartStore`, and `OrderStore` with root scope. Consumers inject stores directly and lazy routes/components must not provide them again. Auth must be one application-wide instance because app initialization, the interceptor, guards, directives, navbar, and pages all depend on the same token/profile state. Root scope also matches the current root-provided services for products, cart, and orders.

**Alternative considered:** feature-route providers. Rejected because lazy injectors could create duplicate state, break cart continuity, and make auth state inconsistent between guards and the interceptor.

### 2. Explicit state interfaces and resource-specific status

Each store defines a named state interface and includes feature data plus loading and error state:

- `AuthState`: token, user, profile-loaded marker, and auth loading/error state.
- `ProductState`: products, selected product, categories, and independent collection/detail/category status.
- `CartState`: items and explicit hydration/persistence status.
- `OrderState`: orders, selected order, and independent list/detail/creation status.

Status is resource-specific wherever requests can overlap. Components read signals and cannot mutate store state directly.

**Alternative considered:** one shared `loading` and `error` field per service. Rejected because concurrent product/category or order list/detail requests would overwrite each other.

### 3. Derived state belongs in `withComputed`

Use `withComputed` for reusable feature invariants: authentication status and roles, cart total item count, and reusable product/order lookups or summaries where they are shared. Keep page-only presentation calculations and form state in components or existing pure utilities.

**Alternative considered:** writable derived fields or repeated component calculations. Rejected because they can become stale and duplicate business rules.

### 4. Selective `rxMethod` with observable-compatible errors

Use `rxMethod` for HTTP reads, profile hydration, and mutations when reactive composition, cancellation, or finalization is useful. Use regular synchronous methods for cart mutations, token clearing, role checks, and storage writes.

Store methods must explicitly set resource status and preserve current contracts: read failures update error state and return existing success-shaped fallbacks where required; mutations propagate HTTP errors to component callers. A public compatibility wrapper may expose the existing observable shape around an internal `rxMethod`, but errors must not be swallowed.

**Alternative considered:** internally subscribe to every command. Rejected because it changes error handling and makes completion/testing less explicit.

### 5. HTTP remains in reusable stateless boundaries

Keep typed HTTP construction in reusable API/data services. `ProductService` and `OrdersService` may become stateless API clients consumed by stores. `AuthService` may become a compatibility facade around `AuthStore` while profile HTTP remains behind a stateless boundary. `CartService` may delegate to `CartStore` because cart has no server boundary.

After each feature cutover, the prior service must either delegate, become stateless, or be removed only when no consumer remains. It must not retain an independent mutable signal source.

**Alternative considered:** stores and services both owning state during transition. Rejected because divergent state would be possible and difficult to diagnose.

### 6. Browser-storage contracts are unchanged

Auth and cart stores preserve `access_token`, `cart_state`, and the existing cart JSON `{ items: [...] }`. Hydration remains browser-safe; malformed JSON and invalid entries produce the same safe empty/filtered result; every cart mutation persists immediately. Theme storage remains owned by `ThemeService`.

**Alternative considered:** a new storage key or versioned envelope. Rejected because it could log users out or discard existing carts.

### 7. Checkout remains coordinated by the cart page

The cart page continues to build the order payload from cart items and address, invokes `OrderStore` order creation, and clears `CartStore` only after successful creation. `CartStore` does not own order HTTP calls, keeping browser persistence separate from server order state.

**Alternative considered:** making cart state own order creation. Rejected because it couples independent state domains and risks clearing carts on failure.

### 8. Dependency compatibility is checked before installation

Implementation must recheck official metadata, add `@ngrx/signals@21.0.1`, and run npm peer-resolution/build checks before modifying consumers. The Angular 22-targeted package line is not selected unless Angular is separately upgraded, which is outside this change.

## Risks / Trade-offs

- **[Risk]** `rxMethod` completion or error semantics differ from the current service observables → **Mitigation:** retain observable-compatible wrappers and test success, fallback, propagation, and final status for each operation.
- **[Risk]** A lazy route accidentally provides a second store → **Mitigation:** root-only providers, provider search, and an auth injector-identity regression test.
- **[Risk]** A migrated service retains writable signals → **Mitigation:** make service cutover a required feature gate and inspect each target service before marking the feature complete.
- **[Risk]** Concurrent requests race on status → **Mitigation:** resource-specific state and overlapping-request tests for product/category and order list/detail.
- **[Risk]** Storage hydration changes user/cart behavior → **Mitigation:** exact key/serialization reuse plus malformed, invalid-entry, and non-browser tests.
- **[Risk]** Failed checkout clears the cart → **Mitigation:** clear only in the order-success path and assert persisted storage after failure.
- **[Risk]** Package peer mismatch → **Mitigation:** verify npm metadata and lockfile resolution before source migration.
- **[Trade-off]** Compatibility facades temporarily add indirection → **Mitigation:** remove or simplify them after consumer inventory confirms they are unused.

## Migration Plan

1. Baseline frontend tests, build, and lint; verify `@ngrx/signals@21.0.1` compatibility.
2. Add the dependency and store scaffolding with explicit interfaces and root scope without changing consumers.
3. Implement `AuthStore`; migrate app initialization, interceptor, guards, directive, navbar, and auth pages; pass the auth regression gate; then cut over `AuthService`.
4. Implement `ProductStore`; migrate catalogue, detail, admin product pages, and cart product loading; retain `SupplierService`; pass product/concurrency gates; then cut over `ProductService`.
5. Implement `CartStore`; migrate product add-to-cart and cart overview; pass storage/persistence/checkout-retention gates; then cut over `CartService`.
6. Implement `OrderStore`; migrate order pages and checkout; pass order and failed-checkout gates; then cut over `OrdersService`.
7. Verify root singleton provisioning, no duplicate mutable service state, unchanged API/mock/storage contracts, and no edits to out-of-scope areas.
8. Run the full frontend tests, production build, lint, and mock/development flow checks.

Rollback is feature-scoped: before each regression gate, consumers can be returned to the retained service facade while the new store remains unreferenced. Production must not run two mutable state owners for the same consumer.

## Open Questions

- During implementation, confirm whether each retained service is best kept as a delegating facade or stateless API client after the final consumer inventory; this does not change the specified behavior or migration order.
