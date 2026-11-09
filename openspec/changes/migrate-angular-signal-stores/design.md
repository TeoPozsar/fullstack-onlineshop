# Design

## Context

The frontend is an Angular 21.2 standalone application with RxJS 7.8, lazy feature routes, functional HTTP interceptors, browser-local cart state, and four target services that currently combine writable signal state with HTTP or storage side effects. See `proposal.md` for motivation and the capability specs for observable behavior.

The application has no NgRx dependency today. The official npm metadata for `@ngrx/signals@21.0.1` declares `@angular/core: ^21.0.0` and `rxjs: ^6.5.3 || ^7.4.0` peer dependencies, which matches the current Angular 21.2/RxJS 7.8 frontend. The current latest 22.x package targets Angular 22 and is not the planned dependency for this Angular 21 application.

The current boundaries that must remain stable are:

- `AuthService` owns `access_token` hydration/persistence, profile loading, roles, and navigation.
- `ProductService` and `OrdersService` catch read failures but propagate mutation failures.
- `CartService` owns synchronous `cart_state` hydration, validation, mutation, and persistence.
- `SupplierService`, `ThemeService`, and `NotificationsService` remain outside scope.
- The mock interceptor depends on the existing `HttpClient` URL, method, body, and auth-header boundary.

## Goals / Non-Goals

**Goals:**

- Establish four independent, root-level singleton SignalStores with explicit typed state interfaces.
- Make stores the sole mutable owner of migrated feature state and prevent duplicate instances across lazy routes.
- Preserve existing HTTP, mock, storage, authentication, cart, checkout, loading, error, and navigation behavior.
- Use `withComputed` for derived feature state and use `rxMethod` only where asynchronous RxJS composition is useful.
- Provide focused store tests and feature-by-feature regression gates before the next migration begins.
- Leave a safe compatibility path where old services delegate to stores or become stateless HTTP boundaries during transition.

**Non-Goals:**

- Do not migrate supplier, theme, notification, form, route, or backend state.
- Do not introduce global actions/reducers/effects or a monolithic application store.
- Do not change API endpoints, DTOs, storage keys/serialization, authorization semantics, or route URLs.
- Do not install NgRx or modify application source as part of this planning change.
- Do not delete or rename existing services before their consumers and compatibility role are verified.

## Decisions

### 1. Four independent root-level stores

Each feature receives one `signalStore({ providedIn: 'root' }, ...)` definition: `AuthStore`, `ProductStore`, `CartStore`, and `OrderStore`. Consumers inject the store directly rather than providing it in lazy route/component providers.

This makes the auth singleton mandatory because the interceptor, guards, directives, app initializer, and navbar must share token/profile state. Root provisioning is also the default for products, cart, and orders because their current services are `providedIn: 'root'` and their state is shared across routes. A test can override each store provider without changing production scope.

**Alternative considered:** provide stores at feature-route scope. Rejected because lazy-loaded route injectors could create duplicate state, break cart persistence expectations, and make auth token/profile state inconsistent across guards and the interceptor.

### 2. Explicit resource state interfaces

Each store defines a named state interface instead of an anonymous state object. Every interface includes feature data plus loading and error properties:

- `AuthState`: token, user, profile-loaded marker, and resource-specific auth loading/error state.
- `ProductState`: products, selected product, categories, and independent collection/selected/categories loading/error state.
- `CartState`: items plus explicit cart loading/error state for hydration/persistence boundaries, even though current mutations are synchronous.
- `OrderState`: orders, selected order, and independent collection/selected loading/error state.

The store state should expose read-only signals. Components should not write state directly. Resource-specific status prevents product, category, supplier-adjacent, order list, and order detail requests from overwriting one another when requests overlap.

**Alternative considered:** retain one `loading` and one `error` field per service. Rejected because the product create/update pages already issue independent requests concurrently and the shared flag cannot represent them reliably.

### 3. `withComputed` for derived feature state

Derived store state belongs in `withComputed` when it is reusable across consumers or represents a feature invariant:

- Authenticated status and roles from token/user.
- Cart total item count, and any store-owned normalized cart derivations.
- Product lookup maps or reusable resource selectors if they reduce repeated consumer computation.
- Order summaries or totals only when they are shared feature state; page-only presentation calculations may remain in existing pure utilities/component computed signals.

The migration must not move generic presentation computations such as icon sizes, form state, or component-local quantity controls into stores.

**Alternative considered:** expose writable fields or recompute derived values separately in every component. Rejected because writable derived state can become stale and duplicated component calculations weaken the single-state contract.

### 4. Async boundary uses `rxMethod` selectively

HTTP reads and mutations that benefit from RxJS composition use `rxMethod`, with explicit success/error/finalization state updates. Synchronous cart mutations, token clearing, role checks, and storage writes use regular store methods.

Read methods must preserve current contracts: product/order read failures update error state, clear selected records where currently required, finish loading, and return the existing success-shaped observable behavior to callers where compatibility requires it. Mutation methods must not swallow errors; create/update/delete/order-create failures remain observable to component error handlers.

**Alternative considered:** make every store method an internally subscribed command. Rejected because it would silently change existing component error handling and make request completion/testing less explicit. The final public method shape may be a small compatibility wrapper around an `rxMethod`, but the error contract remains observable.

### 5. Preserve HTTP services as boundaries without parallel state

The existing service files remain during incremental migration. For migrated features, their mutable signals are removed from ownership before cutover:

- `ProductService` and `OrdersService` can become stateless typed HTTP clients used by stores, preserving URL/payload construction and the mock interceptor boundary.
- `AuthService` can become a compatibility facade delegating to `AuthStore`, while HTTP/profile calls are kept behind a stateless boundary; token reads needed by the interceptor come directly from `AuthStore`.
- `CartService` can become a compatibility facade delegating to `CartStore`, because cart has no server HTTP boundary.

Only one of these approaches is needed per service after implementation review, but no retained service may keep an independent mutable signal state after its feature cutover. A service may be removed later only if no consumer or compatibility contract requires it.

**Alternative considered:** let stores and old services both update their own signals during a long transition. Rejected because it creates divergent products, users, carts, or orders and violates the migration invariant.

### 6. Storage compatibility is a hard boundary

Auth and cart stores preserve `access_token`, `cart_state`, and the current cart JSON `{ items: [...] }` shape. Hydration remains browser-safe, malformed cart JSON still produces an empty cart, invalid entries are filtered identically, and each cart mutation persists immediately, including clear.

No storage migration or versioned envelope is introduced. Theme storage remains owned by `ThemeService`.

**Alternative considered:** change storage keys or add a new versioned persistence format. Rejected because it would log users out or discard existing carts and is outside the requested behavior-preserving migration.

### 7. Checkout remains component-orchestrated across stores

`CartOverviewPageComponent` continues to build the order payload from cart items/address and invokes order creation. `CartStore` exposes synchronous cart mutation/clear behavior; `OrderStore` owns order HTTP state. The cart is cleared only in the order-success path, never in the request-start or error path.

**Alternative considered:** make `CartStore` own order creation. Rejected because it couples browser persistence to server order state and makes failed checkout retention harder to guarantee.

### 8. Compatibility version selection

Plan to add `@ngrx/signals@21.0.1` during implementation, after a fresh official metadata check and package-manager peer-resolution check. Do not select the current 22.x line for this Angular 21 app unless Angular is separately upgraded, which is outside this change.

Evidence checked during planning:

- npm registry metadata: `https://registry.npmjs.org/@ngrx/signals/21.0.1`
- Angular version compatibility reference: `https://angular.dev/reference/versions`

## Risks / Trade-offs

- **[Risk] `rxMethod` completion/error semantics differ from current observable methods** → Keep compatibility wrappers where needed and assert request completion, read fallback, mutation propagation, and final loading state in store tests.
- **[Risk] root provisioning is accidentally duplicated by a lazy route/provider** → Define stores only with root scope, search route/component providers, and add an injector identity test for auth plus a production provider review for all stores.
- **[Risk] old services keep writable signals after cutover** → Make service cutover an explicit task and regression gate; services must delegate or become stateless boundaries before the feature is marked complete.
- **[Risk] concurrent product/category requests cause spinner or error races** → Model resource-specific status and add an overlapping-request test before product migration is accepted.
- **[Risk] browser storage behavior changes during hydration** → Reuse exact keys and serialization, test malformed/invalid payloads, and keep `window` guards.
- **[Risk] order failure clears cart too early** → Keep cart clearing in the success callback/path and test persisted cart contents after an HTTP failure.
- **[Risk] NgRx package peer mismatch** → Verify `@ngrx/signals@21.0.1` metadata and run npm peer-resolution/build checks before modifying the manifest.
- **[Trade-off] temporary compatibility facades add code during migration** → They prevent a flag day and allow one feature at a time to pass regression gates; remove or simplify them only after all consumers are migrated.

## Migration Plan

1. Baseline the current frontend tests, build, and lint; confirm the official package metadata and select `@ngrx/signals@21.0.1`.
2. Add store scaffolding, explicit state interfaces, root providers, and store test utilities without switching consumers.
3. Implement and test `AuthStore`; switch app initializer, interceptor, guards, directive, navbar, and auth pages; pass auth regression gate.
4. Implement and test `ProductStore`; switch product pages and cart product loading; preserve `SupplierService`; pass product/concurrent-loading regression gate.
5. Implement and test `CartStore`; switch add/update/remove/clear consumers; pass storage/malformed-data/persistence regression gate.
6. Implement and test `OrderStore`; switch order pages and checkout; pass order creation/list-update and failed-checkout-retention regression gates.
7. For each completed feature, convert the old service to a delegating facade/stateless HTTP boundary or remove it only if unused; verify no independent mutable state remains.
8. Run full frontend tests, build, lint, mock-mode flow, and targeted browser-storage/auth/checkout checks.

Rollback is feature-scoped: before each gate, consumers can be reverted to the retained service facade while the new store remains unreferenced. Do not run both state owners for the same production consumer at the same time.

## Open Questions

- Confirm the exact `@ngrx/signals@21.0.1` package-manager resolution in the implementation environment before editing `package.json`; the official peer metadata is compatible, but the install/build check remains a required gate.
- After consumer inventory at each cutover, decide whether the retained service is more useful as a delegating facade or a stateless API client. This does not change the observable specs or root-store architecture.
