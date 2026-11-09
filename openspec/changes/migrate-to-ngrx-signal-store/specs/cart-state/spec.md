# Spec Delta

## Purpose

Provides browser-local shopping-cart state with compatible hydration, validation, synchronous mutations, calculations, persistence, and checkout retention semantics.

## ADDED Requirements

### Requirement: Cart state hydrates compatibly
The system SHALL hydrate cart items from the existing `cart_state` storage key and SHALL preserve the serialized `{ items: [...] }` shape.

#### Scenario: Stored cart is valid
- **WHEN** application code initializes cart state with valid stored cart data
- **THEN** the stored items are exposed as the current cart

#### Scenario: Stored cart JSON is malformed
- **WHEN** `cart_state` contains malformed JSON
- **THEN** the cart initializes empty without throwing an uncaught error

#### Scenario: Stored cart contains invalid entries
- **WHEN** `cart_state` contains entries that fail the existing cart-item validation
- **THEN** invalid entries are filtered and valid entries remain available

#### Scenario: Storage is unavailable
- **WHEN** cart state initializes in a non-browser or unavailable-storage context
- **THEN** the cart remains usable with an empty safe default

### Requirement: Cart mutations are synchronous and persistent
The system SHALL provide synchronous add, quantity update, remove, and clear operations and SHALL persist the resulting cart after every mutation.

#### Scenario: An item is added
- **WHEN** a product is added to the cart
- **THEN** the item is inserted or merged according to the existing quantity rules and the resulting cart is persisted

#### Scenario: Quantity is changed
- **WHEN** a cart item quantity is increased or decreased
- **THEN** the existing quantity rules are applied synchronously and the resulting cart is persisted

#### Scenario: An item is removed
- **WHEN** a cart item is removed
- **THEN** it is absent from cart state and persisted storage immediately

#### Scenario: The cart is cleared
- **WHEN** clear is requested
- **THEN** cart items become empty and `cart_state` is persisted in the existing empty-cart format

### Requirement: Cart calculations remain accurate
The system SHALL expose reusable derived cart calculations from the current items without storing duplicated derived values.

#### Scenario: Item count is read
- **WHEN** cart items change
- **THEN** the total item count reflects the current quantities

#### Scenario: Product subtotal is calculated
- **WHEN** a cart consumer calculates a product subtotal
- **THEN** the existing product-price and quantity calculation is preserved

### Requirement: Checkout preserves cart atomicity
The system SHALL retain cart contents until order creation succeeds and SHALL clear the cart only after successful order creation.

#### Scenario: Checkout succeeds
- **WHEN** order creation succeeds for the current cart payload
- **THEN** the cart is cleared and persisted as empty

#### Scenario: Checkout fails
- **WHEN** order creation fails
- **THEN** cart items and persisted `cart_state` remain unchanged and the error reaches the existing checkout handler

### Requirement: Cart state has explicit status
The system SHALL expose explicit cart loading and error state for hydration and persistence boundaries without changing synchronous mutation behavior.

#### Scenario: Cart operation completes
- **WHEN** cart hydration or persistence finishes
- **THEN** the corresponding loading state is complete and any failure is represented by the cart error state
