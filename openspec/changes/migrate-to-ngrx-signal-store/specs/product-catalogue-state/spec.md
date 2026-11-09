# Spec Delta

## Purpose

Provides shared product and category catalogue state for customer and administrator views while preserving the existing typed API, mock API, CRUD, selection, and error contracts.

## ADDED Requirements

### Requirement: Product and category state is shared
The system SHALL expose one shared product catalogue state across catalogue, detail, create, update, and cart product consumers.

#### Scenario: Consumers observe the same catalogue
- **WHEN** catalogue and detail consumers load products during one application session
- **THEN** both observe the same store-owned product and selected-product state

#### Scenario: Product selection is cleared when required
- **WHEN** a selected product request fails or the selected record is explicitly cleared
- **THEN** selected-product state is cleared and the failure state is exposed

### Requirement: Product reads preserve collection and detail behavior
The system SHALL retrieve products and individual products through the existing API contract, expose resource-specific loading and errors, and preserve the current read-failure fallback behavior.

#### Scenario: Product collection loads
- **WHEN** the product collection request succeeds
- **THEN** products are stored, collection loading ends, and collection error is empty

#### Scenario: Product collection fails
- **WHEN** the product collection request fails
- **THEN** collection error is recorded, loading ends, and the read operation returns the existing success-shaped fallback

#### Scenario: Product detail loads
- **WHEN** a product detail request succeeds
- **THEN** the selected product is stored and detail loading ends

#### Scenario: Product detail fails
- **WHEN** a product detail request fails
- **THEN** detail error is recorded, the selected product is cleared as before, and the existing read fallback is returned

### Requirement: Category reads preserve independent resource status
The system SHALL retrieve categories and individual categories through the existing API contract with loading and error state independent from product collection and detail requests.

#### Scenario: Categories load concurrently with products
- **WHEN** product and category requests overlap
- **THEN** each resource reports its own loading and error status without overwriting the other resource

#### Scenario: Category read fails
- **WHEN** a category request fails
- **THEN** category error is recorded, category loading ends, and the existing read fallback behavior is preserved

### Requirement: Catalogue mutations preserve API and error contracts
The system SHALL create, update, and delete products and categories using the existing request payloads and SHALL propagate mutation failures to callers.

#### Scenario: Product creation succeeds
- **WHEN** an authorized product creation request succeeds
- **THEN** the created product is reflected in catalogue state and the operation completes successfully

#### Scenario: Product update succeeds
- **WHEN** an authorized product update request succeeds
- **THEN** the matching product and selected product state reflect the updated record

#### Scenario: Product deletion succeeds
- **WHEN** an authorized product deletion request succeeds
- **THEN** the deleted product is removed from catalogue state and any matching selection is cleared

#### Scenario: Mutation fails
- **WHEN** a product or category mutation is rejected by the API
- **THEN** the operation exposes the HTTP error to its caller and records the relevant mutation error

### Requirement: Supplier integration remains separate
The system SHALL preserve the supplier API/data boundary and existing supplier behavior without duplicating supplier state in the product catalogue state.

#### Scenario: Product form loads suppliers
- **WHEN** an administrator opens a product form
- **THEN** supplier data is requested through the existing supplier boundary and remains available to the form
