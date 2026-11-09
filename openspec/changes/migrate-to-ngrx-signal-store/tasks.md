# Tasks

## 1. Baseline and SignalStore setup

- [ ] 1.1 Run the existing `onlineshopui` test, build, and lint commands and record the baseline; verify the commands complete before dependency changes.
- [ ] 1.2 Recheck official `@ngrx/signals` metadata and Angular/RxJS peer ranges; verify `@ngrx/signals@21.0.1` resolves for Angular 21.2/RxJS 7.8 and the Angular 22 line is not selected.
- [ ] 1.3 Add `@ngrx/signals@21.0.1` to the frontend manifest and lockfile; verify npm installation and peer resolution succeed without changing unrelated dependencies.
- [ ] 1.4 Create root-provided store entry points and explicit state-interface scaffolding for `AuthStore`, `ProductStore`, `CartStore`, and `OrderStore`; verify the expected files compile and no lazy route or component provides a duplicate store.

## 2. Authentication state

- [x] 2.1 Implement `AuthStore` with `withState`, explicit token/user/profile/loading/error state, `withComputed` authentication and role derivation, browser-safe `access_token` hydration/persistence, and synchronous token access; verify store tests cover hydration, roles, logout, and storage clearing.
- [x] 2.2 Add `rxMethod`-based profile, login, and registration workflows where asynchronous composition is useful; verify tests cover profile success/failure, cached profile reuse, login success/failure, registration behavior, error propagation, and final loading state.
- [x] 2.3 Migrate app initialization and `authTokenInterceptor` to `AuthStore`; verify initializer and interceptor tests observe one token source and preserve authorization headers.
- [x] 2.4 Migrate `authGuard`, `guestGuard`, `rolesGuard`, `HasRoleDirective`, `NavbarComponent`, login, and registration consumers to `AuthStore`; verify focused auth consumer tests pass with one shared injector instance.
- [x] 2.5 Convert `AuthService` to a delegating facade or stateless HTTP boundary, or remove it only if no consumer remains; verify it owns no independent mutable auth signals and the complete auth regression gate passes.

## 3. Product catalogue state

- [x] 3.1 Implement `ProductStore` with `withState`, explicit product/category/selection interfaces, independent resource loading/error state, and reusable `withComputed` derivations; verify store tests cover collection, detail, category, and concurrent status behavior.
- [x] 3.2 Add product/category `rxMethod` workflows and mutations while preserving read fallbacks and mutation error propagation; verify HTTP tests cover success, failure, create, update, delete, selection clearing, and state updates.
- [x] 3.3 Migrate catalogue, detail, create, update, and cart product consumers to `ProductStore`; retain `SupplierService` as the supplier boundary and verify component, mock-handler, and supplier integration tests pass.
- [x] 3.4 Convert `ProductService` to a stateless HTTP boundary or delegating facade, or remove it only if no consumer remains; verify it owns no independent product/category signals and the product regression gate passes.

## 4. Cart state

- [x] 4.1 Implement `CartStore` with `withState`, explicit items/loading/error state, browser-safe `cart_state` hydration, exact `{ items: [...] }` serialization, and invalid-entry filtering; verify store tests cover valid, malformed, invalid, and non-browser storage cases.
- [x] 4.2 Implement synchronous cart add, quantity, remove, and clear methods plus `withComputed` item-count derivation; verify tests cover quantity rules, totals, immediate persistence after every mutation, and safe defaults.
- [x] 4.3 Migrate product add-to-cart handlers and `CartOverviewPageComponent` to `CartStore`; verify cart component and utility tests preserve product-price subtotal and order-payload behavior.
- [x] 4.4 Integrate `CartStore` with the checkout success path while retaining the existing `OrdersService` as the order boundary until OrderStore migration; verify failed order creation leaves cart items and persisted `cart_state` unchanged and successful creation clears them.
- [x] 4.5 Convert `CartService` to a delegating facade or remove it only if no consumer remains; verify it owns no independent cart signals and the complete cart regression gate passes.

## 5. Order state

- [ ] 5.1 Implement `OrderStore` with `withState`, explicit list/detail/creation loading/error state, and reusable `withComputed` derivations where needed; verify store tests cover shared state and independent resource status.
- [ ] 5.2 Add order list/detail retrieval and creation workflows using selective `rxMethod`; verify tests cover authenticated requests, read fallbacks, selected-record clearing, creation error propagation, successful list prepending, and final status.
- [ ] 5.3 Migrate order overview/detail pages and checkout to `OrderStore`; verify order component tests, mock-handler tests, request payloads, and auth-header behavior remain compatible.
- [ ] 5.4 Convert `OrdersService` to a stateless HTTP boundary or delegating facade, or remove it only if no consumer remains; verify it owns no independent order signals and the complete order regression gate passes.

## 6. Cross-feature verification

- [ ] 6.1 Inspect all target-service providers and consumers after cutover; verify each migrated feature has exactly one root-level mutable state owner, no duplicate lazy-route providers, and no retained service signal state.
- [ ] 6.2 Run the full frontend test suite, production build, and lint; verify existing DTOs, API URLs, mock handlers, storage keys/formats, route guards, error contracts, and navigation behavior remain unchanged.
- [ ] 6.3 Exercise development and mock-mode flows for token/profile hydration, product/category loading, cart persistence, checkout success/failure, order list refresh, and order detail retrieval; verify out-of-scope supplier, theme, notification, and backend files remain unchanged.

## Workflow follow-up

- Review the implementation against `auth-state`, `product-catalogue-state`, `cart-state`, and `order-state`.
- Archive the OpenSpec change only after all implementation tasks and regression gates are complete.
