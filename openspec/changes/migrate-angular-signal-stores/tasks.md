# Tasks

## 1. Baseline and compatibility

- [ ] 1.1 Run the existing frontend test, build, and lint commands from `onlineshopui` and record the baseline results before changing dependencies; verify `npm test`, `npm run build`, and `npm run lint` complete successfully.
- [ ] 1.2 Verify the official `@ngrx/signals` package metadata and Angular/RxJS peer ranges, select `@ngrx/signals@21.0.1` for Angular 21.2/RxJS 7.8, and document the check; verify npm reports compatible peers without installing the Angular 22-targeted 22.x line.
- [ ] 1.3 Add the selected SignalStore dependency and create four root-provided store entry points with explicit state interfaces containing feature data, loading, and error properties; verify the manifest/lockfile resolve and no lazy route or component provides a second store instance.

## 2. Authentication state migration

- [ ] 2.1 Implement `AuthStore` with token/profile state, resource-specific auth loading/error state, `withComputed` authentication and role derivation, browser-safe `access_token` hydration/persistence, synchronous token access, and selective `rxMethod` async flows; verify store tests cover hydration, synchronous token reads, login/profile success and failure, cached profile reuse, logout, and role checks.
- [ ] 2.2 Migrate app initialization, `authTokenInterceptor`, `authGuard`, `guestGuard`, `rolesGuard`, `HasRoleDirective`, `NavbarComponent`, login, and registration to the singleton `AuthStore`; verify auth interceptor, guard, directive, navbar, and page regression tests pass with one shared injector instance.
- [ ] 2.3 Convert `AuthService` to a delegating facade or stateless HTTP boundary, or remove it only if no compatibility consumer remains; verify it no longer owns independent mutable auth state and the complete auth-focused test set passes before beginning product migration.

## 3. Product catalogue state migration

- [ ] 3.1 Implement `ProductStore` with products, selected product, categories, explicit resource-specific loading/error state, `withComputed` derived state where reusable, and HTTP methods that preserve read fallback and mutation error contracts; verify store tests cover collection/detail/category success and failure, concurrent product/category requests, create, update, delete, and selected-record updates.
- [ ] 3.2 Migrate catalogue, detail, create, update, and cart product consumers to `ProductStore`, retain `SupplierService` unchanged as the supplier boundary, and update consumer/mocking tests; verify product component, HTTP, mock-handler, and concurrent-loading regression tests pass before beginning cart migration.
- [ ] 3.3 Convert `ProductService` to a stateless HTTP boundary or delegating facade, or remove it only if no compatibility consumer remains; verify it no longer owns product/category mutable state and product consumers observe one root store instance.

## 4. Cart state migration

- [ ] 4.1 Implement `CartStore` with an explicit state interface, browser-safe `cart_state` hydration, exact `{ items: [...] }` serialization, invalid-entry filtering, synchronous mutation methods, `withComputed` total item count, and explicit loading/error fields; verify store tests cover localStorage compatibility, malformed JSON, invalid entries, quantity rules, totals, persistence after every mutation, and non-browser safety.
- [ ] 4.2 Migrate product add-to-cart handlers and `CartOverviewPageComponent` to `CartStore`, preserving current product-price subtotal calculation and order payload construction; verify cart component, utility, and storage regression tests pass and failed checkout leaves cart items and persisted `cart_state` unchanged.
- [ ] 4.3 Convert `CartService` to a delegating facade or remove it only if no compatibility consumer remains; verify it no longer owns independent cart signals and the complete cart-focused test set passes before beginning order migration.

## 5. Order state migration

- [ ] 5.1 Implement `OrderStore` with orders, selected order, explicit list/detail loading/error state, `withComputed` derived state where shared, and selective `rxMethod` retrieval/creation workflows; verify store tests cover list/detail success and read fallback, selected-record clearing, order creation error propagation, and prepending created orders.
- [ ] 5.2 Migrate order overview/detail pages and cart checkout to `OrderStore`, preserving authenticated/mock HTTP behavior, existing order payloads, clear-cart-only-after-success semantics, and failed-checkout cart retention; verify order component, mock-handler, order creation/list-update, and checkout failure regression tests pass.
- [ ] 5.3 Convert `OrdersService` to a stateless HTTP boundary or delegating facade, or remove it only if no compatibility consumer remains; verify it no longer owns independent order signals and the complete order-focused test set passes.

## 6. Cross-feature verification and cutover

- [ ] 6.1 Inspect all target-service providers and consumers after cutover and verify each feature has exactly one root-level mutable state owner, no duplicate lazy-route store providers, and no retained service with independent mutable feature signals.
- [ ] 6.2 Run the full frontend test suite, production build, and lint after all feature gates pass; verify existing DTOs, API URLs, mock interceptor handlers, storage keys/formats, route guards, error propagation, and navigation behavior remain unchanged.
- [ ] 6.3 Exercise development and mock-mode flows for hydration/login, product/category loading, cart persistence, checkout success/failure, order list refresh, and order detail retrieval; verify no source changes are made to out-of-scope supplier, theme, notification, or backend areas.

## Workflow follow-up

- Review the completed implementation against all four capability specifications.
- Archive the OpenSpec change only after implementation and regression gates are approved.
