# NgRx SignalStore migration plan

## 1. Goal and boundaries

Migrate the Angular frontend from stateful injectable services to four root-provided NgRx SignalStores:

- `ProductStore`
- `CartStore`
- `AuthStore`
- `OrderStore`

The migration is incremental. Each store becomes the single owner of its feature state, derived state, mutations, loading/error transitions, and stateful side effects. Typed `*ApiService` classes own HTTP request construction only.

The existing application behavior is the acceptance baseline. Preserve:

- REST endpoints, HTTP methods, DTOs, request bodies, response handling, and mock-interceptor behavior.
- `access_token` and `cart_state` storage keys and their current formats.
- Generic load-error messages and raw mutation errors reaching current component notifications.
- Registration payload shape, navigation, guards, interceptor behavior, and checkout ordering.
- Component-visible loading, error, empty, retry, and notification behavior.

Out of scope:

- Angular upgrades, including Angular 22.
- Product filtering, sorting, pagination, entity adapters, actions/reducers/effects, or a global NgRx store.
- New error formats, a global error interceptor, automatic logout, or backend/API changes.
- Migration of `ThemeService`, `NotificationsService`, or component-local UI signals.

## 2. Baseline and non-negotiable behavior

### Current boundaries

The documented system boundary remains:

`Browser -> Angular SPA (onlineshopui) -> /api Spring Boot REST API (onlineshopapi) -> PostgreSQL`

Preserve the existing standalone Angular application, lazy routes, `clib`/`core`/`features` boundaries, typed DTOs, functional interceptors, environment configuration, Vitest/TestBed setup, and mock API interceptor.

Primary references:

- `docs/ARCHITECTURE.md`
- `docs/PROJECT.md`
- `onlineshopui/package.json`
- `onlineshopui/src/app/app.config.ts`
- `onlineshopui/src/app/app.routes.ts`
- Existing feature services, consumers, and specs

### Compatibility decision

The repository declares Angular 21.2.x, TypeScript 5.9.x, and RxJS 7.8.x. Install the compatible SignalStore major only after verifying the actual dependency graph:

```powershell
cd C:\TrainingWorkspace\teo\fullstack-onlineshop\onlineshopui
npm install --save-exact @ngrx/signals@21.0.1
npm ls @angular/core @ngrx/signals rxjs
```

Do not install the Angular 22 NgRx major or upgrade Angular as part of this migration. If registry peer metadata or the resolved dependency graph differs, stop and re-evaluate the package choice before changing source files.

### State ownership

| Domain | Current owner | Target owner | Persistence |
|---|---|---|---|
| Products, selected product, categories, suppliers | `ProductService` and `SupplierService` | `ProductStore` | None |
| Cart items and derived totals | `CartService` | `CartStore` | `localStorage.cart_state` |
| Token, user, profile, roles | `AuthService` | `AuthStore` | `localStorage.access_token` |
| Orders and selected order | `OrdersService` | `OrderStore` | None |
| Theme | `ThemeService` | Unchanged | Existing `theme` key |
| Notifications | `NotificationsService` | Unchanged | None |

There must be one state owner per domain and persisted value. Temporary adapters, if required during a phase, may delegate to a store but must not contain duplicate signals or persistence logic.

### Behavioral invariants

- Product and order list/detail/category/supplier operations use independent loading/error fields. One concurrent operation must not clear another operation's status.
- Load failures preserve the current generic message and completion behavior. Mutation failures preserve raw error propagation to existing subscribers.
- `ProductStore` owns product, category, and supplier state. Supplier HTTP access remains stateless.
- `CartStore` reads current product prices from `ProductStore` through a one-way dependency for subtotal calculation. It must not copy product data, and `ProductStore` must not inject `CartStore`.
- Checkout remains a page-level transaction: create the order, then clear the cart, notify, and navigate only after successful creation.
- Components retain forms, transient UI state, notifications, and navigation. Stores retain state transitions, HTTP orchestration, and auth/cart persistence.
- `provideAppInitializer` remains the explicit profile initialization boundary. Do not add a competing profile request through `withHooks`.
- Concurrent profile callers share one `/auth/profile` request. A profile response or finalizer from an obsolete session must not restore state or alter a newer request.

## 3. Target architecture

```text
Component/guard/interceptor
        |
        v
Feature SignalStore
        |
        v
Typed feature *ApiService
        |
        v
HttpClient + existing interceptors
        |
        v
Spring Boot API or mock interceptor
```

All four stores use `signalStore({ providedIn: 'root' }, ...)`, explicit typed state, `withState`, `withComputed` for real domain projections, `withMethods` for mutations and async orchestration, and `patchState` for state transitions. Use `rxMethod` only for genuinely reactive input/cancellation behavior; current one-shot page actions should return typed Observables and preserve existing subscription/error contracts.

### Store contracts

| Store | State and derived values | Required operations | API boundary |
|---|---|---|---|
| `ProductStore` | Products, selected product, categories, suppliers; counts/flags; operation-specific loading/errors | `loadAll`, `loadById`, `loadCategories`, `loadSuppliers`, `create`, `update`, `delete`, `clearSelectedProduct` | `ProductApiService`, `SupplierApiService` |
| `CartStore` | Items; `totalItems`, `isEmpty`, `subtotal` | `addItem`, `updateQuantity`, `removeItem`, `clear` | Storage helper or private persistence methods; read-only `ProductStore` dependency |
| `AuthStore` | Token, user, profile state; authentication and roles | `login`, `register`, `logout`, `loadProfileIfNeeded`, `hasRole` | `AuthApiService` |
| `OrderStore` | Orders, selected order; summaries and selected total; operation-specific loading/errors | `loadAll`, `loadById`, `create`, `clearSelectedOrder` | `OrdersApiService` |

### API services

Create or adapt these stateless services:

```text
features/products/services/product-api.service.ts
features/products/services/supplier-api.service.ts
features/auth/services/auth-api.service.ts
features/orders/services/orders-api.service.ts
```

They contain typed `HttpClient` calls only. They do not own signals, loading/error state, persistence, notifications, navigation, or collection mutation logic. Components must not inject them for feature state.

### Error and HTTP contract

| Area | Existing contract to preserve |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/profile`; registration includes `roles: ['user']`; login persists the token before profile loading |
| Products | Existing `/products` collection/detail/CRUD URLs and `/products/categories`; mutations retain raw errors |
| Suppliers | `GET /suppliers`; load failures retain the current generic message |
| Orders | `GET /orders`, `GET /orders/{id}`, `POST /orders`; create prepends the returned order |
| Backend errors | Spring responses commonly use `{ error: string }`; mock handlers may use `{ message: string }`; do not normalize the contract globally |
| Network failures | Status `0` follows the current generic load or raw mutation error path |
| Authorization | No automatic logout or new 401/403 interceptor; backend authorization remains authoritative |

## 4. Feature-specific design

### ProductStore

Use explicit state for:

```text
products, selectedProduct, categories, suppliers
productsLoading/productsError
selectedProductLoading/selectedProductError
categoriesLoading/categoriesError
suppliersLoading/suppliersError
creating/createError
updating/updateError
deleting/deleteError
```

Preserve product insertion, replacement, deletion, selected-product clearing, category/supplier URLs, generic load messages, swallowed load failures, and mutation error propagation. Do not add filtering, sorting, pagination, or unrelated product projections.

### CartStore

Preserve the `cart_state` payload `{ items: CartItem[] }`, SSR guards, corrupt/missing storage fallback, invalid-item filtering, quantity rules, and one write after each mutation. `subtotal` is derived from current `ProductStore` prices and is not persisted. Keep address validation, checkout submission state, notifications, and navigation in the page component.

### AuthStore

Preserve:

- Token restore, persistence, and removal through `access_token`.
- `isAuthenticated`, role derivation, empty-role semantics, and existing `hasRole` behavior.
- Login token-before-profile ordering and token retention when profile loading fails.
- Registration payload and existing success navigation.
- Logout state cleanup and navigation.
- Synchronous auth/guest guard behavior and observable role-guard behavior.

Implement independent `login`, `register`, and `profile` loading/error fields. Handle login API errors before the profile `switchMap`; profile failures update `profileError`, propagate to callers, preserve the token, and do not overwrite `loginError`.

The profile workflow must keep a private shared/replayed in-flight Observable identified by both token and session generation. On logout or successful replacement of token A with token B:

1. Increment the session generation.
2. Invalidate the previous profile request identity.
3. Clear the previous user/profile cache before loading the new profile.
4. Prevent stale responses and finalizers from patching the new session.

The A -> B -> A sequence must still reject the original A response because the generation changed twice.

### OrderStore

Use independent list/detail/create loading and error fields. Preserve list replacement, selected-order clearing, newest-first insertion, 201 handling, raw mutation errors, and existing generic load messages. Keep checkout composition in `CartOverviewPageComponent`; `OrderStore` must not clear `CartStore`.

## 5. Consumer migration

Update consumers by feature rather than creating a compatibility layer that leaves two state owners active.

| Area | Consumers | Migration rule |
|---|---|---|
| Auth and shared UI | App initializer, token interceptor, auth/guest/roles guards, role directive, login/register pages, navbar | Inject `AuthStore`; preserve synchronous decisions, profile loading, messages, navigation, and header construction |
| Products | Catalog, detail, create, update pages; product-related specs | Inject `ProductStore`; inject `CartStore` only where cart actions are needed; retain local modal/form/submission state |
| Cart | Catalog/detail pages and cart overview | Inject `CartStore`; cart overview also reads `ProductStore` and `OrderStore`; retain checkout form and success ordering |
| Orders | Overview/detail pages and cart overview | Inject `OrderStore`; retain route navigation, retry behavior, and component presentation |
| Presentational views | Product cards/forms, cart rows/summary, order cards | Remain store-independent unless an existing input/output contract requires a change |

Templates should change only for renamed store fields or direct store access. No template may call `HttpClient`, an API service, or `patchState`.

## 6. Incremental roadmap

Every phase must leave the application buildable. After a feature cutover, do not keep the old and new state owners active for that feature.

| Phase | Objective and key work | Dependencies | Acceptance |
|---|---|---|---|
| 1. Dependency baseline | Run baseline test/build/lint; verify Angular/RxJS ranges; install and verify `@ngrx/signals@21.0.1`; record pre-existing failures. | None | Compatible package graph and unchanged source behavior. |
| 2. Product migration | Add ProductStore and typed product/supplier API services; migrate product pages/specs and product reads in cart; remove old state owners after cutover. | 1 | Product/category/supplier consumers use ProductStore and existing requests/messages pass. |
| 3. Auth migration | Add AuthStore/AuthApiService; migrate initializer, interceptor, guards, directive, pages, navbar, and specs; implement single-flight and session-generation protections. | 1 | Token/profile/role/navigation behavior, error separation, request count, and stale-response tests pass. |
| 4. Cart migration | Add CartStore; preserve storage and quantity behavior; wire one-way subtotal projection and checkout ordering. | 1, 2 | Cart state has one owner; serialized storage and clear-after-success behavior match baseline. |
| 5. Order migration | Add OrderStore/OrdersApiService; migrate order pages/specs and checkout integration. | 1, 4 | List/detail/create behavior, projections, errors, and checkout regression tests pass. |
| 6. Application cutover | Search all consumers and test doubles for obsolete stateful services; update aliases, templates, providers, guards, directives, and interceptors. | 2-5 | No UI/infrastructure consumer injects an obsolete stateful service. |
| 7. Legacy cleanup | Remove obsolete services/specs, duplicate providers/imports, and residual writable signal/persistence logic. | 6 | One state owner per domain/key; targeted and full verification passes. |
| 8. Documentation | Update `docs/ARCHITECTURE.md` with the final store/API boundaries, persistence, auth profile rules, mock boundary, and dependency baseline. | 7 | Documentation matches verified source and does not describe aspirational behavior. |
| 9. Final acceptance | Run full verification and mock-mode smoke flows for auth, products, cart, checkout, orders, admin CRUD, logout, and route access. | 8 | Tests, build, lint, and smoke flows pass with no API/backend changes. |

### Phase-specific rollback rule

Preserve phase boundaries in commits or equivalent review units. If a phase fails, revert or isolate that phase only; do not remove tests, disable behavior, or reset unrelated worktree changes.

## 7. Verification strategy

### Test matrix

| Area | Required coverage |
|---|---|
| Stores | Initial state; computed values; success/failure transitions; independent loading/error fields; collection mutations; selected-record clearing |
| API services | Exact URL, verb, request body, typed response, and 201/204 handling for products, suppliers, auth, and orders |
| Auth concurrency | One request for concurrent initializer/navbar/guard/directive callers; retry after failure; stale response protection after logout; A -> B -> A generation protection; stale finalizer cannot reset a newer request |
| Persistence | `access_token` restore/set/remove; `cart_state` restore, invalid-entry filtering, malformed JSON fallback, exact writes, empty-cart persistence, SSR guards |
| Components | Existing forms, notifications, navigation, loading/error/empty states, route retries, admin behavior, and checkout clear-after-success |
| Errors | Spring `{ error: ... }`, mock `{ message: ... }`, 400/401/403/404/409/422/500, status `0`, generic load messages, and raw mutation errors |
| Mock mode | Registration/login/profile, product browsing and CRUD, cart, checkout, orders, logout, and guarded routes |

Split old service specs rather than copying them wholesale: state assertions move to store specs and URL/body assertions move to API service specs. Presentational component specs should remain store-independent.

### Commands

Run the smallest relevant selector during development. Before acceptance, run:

```powershell
cd C:\TrainingWorkspace\teo\fullstack-onlineshop\onlineshopui
npm test -- --watch=false
npm run build
npm run lint
npm run start:mock
```

Stop an attached mock server with its specific process ID after smoke testing.

## 8. Focused risks and decisions

| Risk | Required mitigation |
|---|---|
| Auth regression or token loss | Test token-before-profile ordering, separate login/profile errors, profile failure token retention, logout cleanup, guards, interceptor, and navigation before deleting `AuthService`. |
| Duplicate or stale profile requests | Keep app initializer as the only initialization boundary; share in-flight requests; guard response/finalizer updates with token and generation identity. |
| Duplicate state owners | Split API services from stores, search for old service imports/signals/storage keys, and delete obsolete state owners after consumer cutover. |
| Cart inconsistency | Compare every existing storage and quantity edge case; verify subtotal follows current ProductStore prices without copying products. |
| Async races | Use operation-specific fields and identity-safe finalizers; do not introduce implicit cancellation without a test. |
| API/mock drift | Assert exact requests and both backend/mock error payload shapes; do not change interceptors or backend contracts. |
| Store dependency cycles | Permit only `CartStore -> ProductStore` read access; `ProductStore` and `OrderStore` must not inject `CartStore`. |
| Overengineering | Do not add global reducers/effects, router-store, entity adapters, filtering, pagination, or unnecessary `rxMethod`. |

Deferred implementation choices:

- Rename `SupplierService` to `SupplierApiService`, or convert it in place, provided it becomes stateless and only ProductStore consumes it.
- Place shared error extraction in a helper only if it preserves existing messages and raw mutation errors.

## 9. Post-migration documentation and acceptance

After source and tests are stable, update `docs/ARCHITECTURE.md` to document:

1. The Angular baseline and compatible pinned SignalStore major.
2. The four root-provided stores and their state ownership.
3. The typed `*ApiService` transport boundary.
4. ProductStore ownership of products, categories, and suppliers.
5. CartStore persistence and the unchanged `cart_state` format.
6. AuthStore token lifecycle, profile single-flight behavior, and stale-session invalidation.
7. OrderStore ownership and page-level checkout composition.
8. Component ownership of forms, transient UI state, notifications, and navigation.
9. The unchanged mock-interceptor boundary and backend error strategy.

### Final acceptance checklist

- `@ngrx/signals@21.0.1` is peer-compatible with the resolved Angular 21.x/RxJS 7.8.x graph; no Angular upgrade was performed.
- `ProductStore`, `CartStore`, `AuthStore`, and `OrderStore` are root-provided and have explicit typed state.
- Product and order operations expose independent loading/error state.
- ProductStore owns supplier/category state; no migrated service retains duplicate signals.
- CartStore owns cart persistence and reads ProductStore prices without copying product state.
- Typed API services contain HTTP calls only; no component orchestrates `HttpClient`.
- Existing URLs, bodies, DTOs, storage formats, mock handlers, notifications, navigation, and error behavior remain compatible.
- Concurrent profile callers produce one request; failed profile requests can retry without removing the token.
- Logout and token replacement invalidate stale profile responses and finalizers, including A -> B -> A.
- Store, API, persistence, HTTP/error, auth integration, component, and mock-mode tests cover the migrated behavior.
- `npm test -- --watch=false`, `npm run build`, and `npm run lint` pass.
- Mock-mode end-to-end flows pass.
- `docs/ARCHITECTURE.md` describes the verified final implementation.
