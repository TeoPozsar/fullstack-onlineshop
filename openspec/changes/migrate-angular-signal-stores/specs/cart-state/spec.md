# Spec Delta

## Purpose

Provides the browser-local shopping cart with compatible hydration, mutation, persistence, quantity calculations, and checkout handoff behavior independent of product and order server state.

## ADDED Requirements

### Requirement: Cart hydration preserves the existing storage format

The cart SHALL read `localStorage['cart_state']` as `{ items: CartItem[] }`, treat missing or malformed data as an empty cart, and retain only entries with a non-empty product ID and positive quantity.

#### Scenario: Existing cart data is restored

- **GIVEN** localStorage contains valid `cart_state` JSON with valid items
- **WHEN** cart state is created
- **THEN** the valid items are available and their quantities are reflected in the total item count

#### Scenario: Cart data is malformed

- **GIVEN** localStorage contains invalid JSON or an invalid cart payload
- **WHEN** cart state is created
- **THEN** the cart starts empty without throwing

#### Scenario: Cart data contains invalid entries

- **GIVEN** stored items include an empty product ID, zero quantity, or negative quantity
- **WHEN** cart state is created
- **THEN** invalid entries are excluded and valid entries remain

### Requirement: Synchronous cart mutations preserve quantity rules

Cart add, update, remove, and clear operations SHALL preserve existing quantity validation, duplicate-item merging, item ordering, and total item-count behavior.

#### Scenario: An item is added

- **WHEN** a positive quantity is added for a product
- **THEN** a new item is added or the existing product quantity is increased

#### Scenario: A non-positive item quantity is added

- **WHEN** zero or a negative quantity is added
- **THEN** the cart remains unchanged

#### Scenario: An item quantity becomes non-positive

- **WHEN** an existing item is updated to zero or a negative quantity
- **THEN** that item is removed from the cart

#### Scenario: The cart is cleared

- **WHEN** clear is invoked
- **THEN** the items are empty and the total item count is zero

### Requirement: Every cart mutation is persisted

Each successful cart mutation SHALL immediately rewrite `cart_state` using the existing `{ items: [...] }` JSON shape, including when the resulting cart is empty.

#### Scenario: A cart mutation persists

- **WHEN** an add, update, remove, or clear operation changes cart state
- **THEN** localStorage contains the current items under `cart_state`

#### Scenario: Browser storage is unavailable

- **GIVEN** the application is running without a browser `window`
- **WHEN** cart state is initialized or mutated
- **THEN** cart operations remain safe and do not throw due to storage access

### Requirement: Cart calculations use current product data

The cart view SHALL calculate total item count from cart quantities and subtotal/line totals from the current product prices, omitting products that are not present in the loaded product collection.

#### Scenario: Product prices are loaded for cart items

- **WHEN** the cart view has cart items and matching product data
- **THEN** subtotal and line totals equal price multiplied by quantity and are formatted as existing currency strings

#### Scenario: A stored product is unavailable

- **WHEN** a persisted cart item has no matching loaded product
- **THEN** that product contributes no displayed subtotal and does not cause a rendering failure

### Requirement: Checkout clears cart only after order success

Checkout SHALL submit the existing order payload and clear the cart only after order creation succeeds; an order error SHALL propagate to the checkout caller while retaining all cart items.

#### Scenario: Checkout succeeds

- **WHEN** order creation returns success for the cart items and address
- **THEN** the cart is cleared, success feedback is shown, and navigation proceeds to order history

#### Scenario: Checkout fails

- **WHEN** order creation returns an HTTP error
- **THEN** the cart items remain persisted and available, the failure is surfaced to the caller, and success navigation/clearing does not occur

