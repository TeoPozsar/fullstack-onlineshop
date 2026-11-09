# Spec Delta

## Purpose

Provides shared product, selected-product, and category state for catalogue browsing and product administration while preserving the existing API payloads, mock behavior, and read-versus-mutation error contracts.

## ADDED Requirements

### Requirement: Product and category state is shared across consumers

All product consumers SHALL observe one consistent product feature state for catalogue items, the selected product, categories, and each resource's loading and error status.

#### Scenario: Catalogue and cart observe one product collection

- **WHEN** the catalogue loads products successfully
- **THEN** the catalogue and cart overview observe the same product collection without separate mutable product state

### Requirement: Product reads expose resource-specific status

Product collection, selected-product, and category reads SHALL expose loading and error state independently so concurrent requests do not clear or overwrite one another's status.

#### Scenario: Products and categories load concurrently

- **WHEN** a product page starts product and category requests at the same time
- **THEN** each resource reports its own loading completion and error result without hiding an active request from the other resource

#### Scenario: Product collection read fails

- **WHEN** `GET /products` fails
- **THEN** the product collection remains compatible with the existing empty/read-error behavior, the collection error is exposed, and the collection loading state completes

#### Scenario: Selected product read fails

- **WHEN** `GET /products/{id}` fails
- **THEN** the selected product is cleared, the selected-product error is exposed, and its loading state completes with the read operation's existing success-shaped error handling

#### Scenario: Categories read fails

- **WHEN** `GET /products/categories` fails
- **THEN** the category error is exposed and category loading completes with the existing read-operation error behavior

### Requirement: Product mutations preserve API and local collection behavior

Product create, update, and delete operations SHALL use the existing request payloads and endpoints, update the shared collection and selected record as before, and propagate mutation errors to their callers.

#### Scenario: Product creation succeeds

- **WHEN** `POST /products` returns a new product
- **THEN** the returned product is appended to the shared product collection and the operation returns the created product

#### Scenario: Product update succeeds

- **WHEN** `PUT /products/{id}` returns an updated product
- **THEN** the matching collection item is replaced and the selected product is replaced when it has the same ID

#### Scenario: Product deletion succeeds

- **WHEN** `DELETE /products/{id}` succeeds
- **THEN** the matching collection item is removed and the selected product is cleared when it has the same ID

#### Scenario: Product mutation fails

- **WHEN** a product create, update, or delete request returns an HTTP error
- **THEN** the error propagates to the caller and the failed mutation does not report success

### Requirement: Product integration preserves the existing HTTP boundary

Product state operations SHALL continue to use the configured API URL, existing DTO shapes, auth interceptor, and mock interceptor handlers for development and mock environments.

#### Scenario: Mock catalogue request is made

- **WHEN** a product read or mutation runs in the mock environment
- **THEN** the existing mock handler receives the same method, path, and body shape and returns data through the normal HTTP client boundary

