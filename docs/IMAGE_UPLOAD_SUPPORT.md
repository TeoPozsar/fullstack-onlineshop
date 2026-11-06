# Product image upload support plan

## Goal

Enable admins to upload one product image (JPEG/PNG), replace it later, and show it reliably in catalog and detail pages with placeholder fallback when missing.

## Scope and constraints

- Stack: Angular (`onlineshopui`) + Spring Boot (`onlineshopapi`).
- Keep `products.image_url` as the image reference field.
- Store image bytes on backend filesystem (not DB blobs).
- Enforce validation on both frontend and backend:
  - max size: 5 MB,
  - types: `image/jpeg`, `image/png`.
- Upload errors must surface through `NotificationsService`.
- Image must persist across reloads and backend restarts (durable storage path).

## Recommended API design

### Keep existing metadata endpoints

- `POST /api/products`
- `PUT /api/products/{id}`
- `GET /api/products`
- `GET /api/products/{id}`

These remain JSON-based and handle product metadata only.

### Add upload endpoint (admin only)

- `POST /api/products/{id}/image`
- `Content-Type: multipart/form-data`
- File part name: `file`
- Returns updated `ProductResponseDto`

Behavior:

- reject empty file,
- reject unsupported type,
- reject file > 5 MB,
- replace existing image for that product.

### Add image serving endpoint

- `GET /api/products/{id}/image`

Behavior:

- return image bytes + correct content type,
- return `404` if image does not exist.

Use this stable endpoint as `imageUrl` so consumers do not depend on filesystem paths.

## Security and access

- Upload endpoint stays admin-only (`@PreAuthorize("hasRole('ADMIN')")`).
- Image GET endpoint should be browser-readable for `<img>` usage, since Angular `HttpClient` interceptor does not apply to image tag requests.
- Keep all other existing product authorization behavior unchanged.

## Backend implementation plan

### 1) Storage and config

- Add image storage configuration:
  - base directory,
  - max size (5 MB),
  - allowed types.
- Implement storage service with:
  - safe filename generation (product ID + extension),
  - path normalization and traversal protection,
  - replace semantics (new file replaces old one),
  - atomic write where practical.

### 2) Service and controller changes

- Add upload and read-image methods in product service layer.
- Add `POST /products/{id}/image` and `GET /products/{id}/image` endpoints.
- On successful upload:
  - store file,
  - set/update `Product.imageUrl` to stable endpoint,
  - persist product,
  - return updated DTO.

### 3) Error handling

Extend global exception handling for:

- invalid type,
- file too large,
- empty/missing file,
- image not found,
- storage failure.

Return consistent JSON error shape (`timestamp`, `status`, `error`) with suitable status codes.

## Frontend implementation plan

### 4) Product form update

- Replace URL text input with `type="file"` input in reusable `product-form`.
- Set `accept="image/jpeg,image/png"`.
- Keep file state separate from JSON form value.
- Show concise helper text (JPEG/PNG, max 5 MB).

### 5) Client validation

Validate selected file for:

- MIME type (jpeg/png),
- size (<= 5 MB),
- non-empty file.

If invalid:

- mark control touched/invalid,
- show clear message,
- block submission.

### 6) Create/update flow

Update `product-create-page` and `product-update-page`:

1. Save metadata via existing create/update API.
2. If a file is selected, call upload API with returned product ID.
3. Show success notification only when all required steps succeed.
4. Show error notification when upload fails.
5. Reset submit state in all paths.

Update service API:

- add `uploadImage(productId: string, file: File): Observable<ProductDto>`,
- send `FormData`,
- update local signals (`_products`, `_selectedProduct`) from response.

### 7) Display behavior

- Keep placeholder fallback when no image URL exists.
- Use returned `imageUrl` in:
  - product catalog card thumbnail,
  - product detail image.
- Keep/add image load error fallback to placeholder.

Also verify existing cart/order image consumers continue to render correctly.

## Mock mode alignment

Extend mock product handlers to support upload contract so frontend flows keep working in mock environment:

- accept simulated upload request,
- return updated product DTO with image URL reference,
- preserve existing behaviors when no file is selected.

## Test plan

### Backend tests

- `ProductControllerTest`:
  - upload success (admin),
  - upload forbidden (non-admin),
  - invalid type,
  - oversized file,
  - missing product,
  - image GET success + content type,
  - image GET 404.
- `ProductServiceTest` (and storage-focused tests):
  - save valid JPEG/PNG,
  - reject invalid/oversized/empty file,
  - replace existing image,
  - handle storage failure.

### Frontend tests

- `product.service.spec.ts`:
  - multipart request shape,
  - state updates after upload,
  - error propagation.
- create/update page specs:
  - metadata-only flow,
  - metadata + upload flow,
  - validation failures,
  - notification on upload error.
- display specs:
  - uses uploaded image URL,
  - placeholder fallback without image or on load error.

### Manual verification

1. Admin creates product with valid JPEG/PNG.
2. Catalog and detail show image.
3. Admin uploads replacement image; old one is replaced.
4. >5 MB and non-image files show validation errors.
5. Upload failures show `NotificationsService` error.
6. Reload page and restart backend; image still resolves with durable storage.

## Acceptance criteria coverage

| Story criterion | Covered by |
|---|---|
| Admin can upload JPEG/PNG on create/update | File input + upload endpoint + admin auth |
| One image per product, replacement support | Storage replace semantics + service update |
| Catalog thumbnail display | Product card uses uploaded `imageUrl` |
| Detail image display | Product detail uses uploaded `imageUrl` |
| Placeholder when missing | Existing fallback retained and tested |
| >5 MB validation error | Frontend validator + backend enforcement |
| Non-image validation error | Frontend validator + backend enforcement |
| Upload errors via notifications | Create/update error handling with `NotificationsService` |
| Persist after reload | DB image reference + durable file storage + GET endpoint |

## Implementation order

1. Add backend storage config and service.
2. Add upload and image-serving endpoints.
3. Add backend validation and exception mapping.
4. Update security rules for image GET and admin upload.
5. Add frontend file input and validators.
6. Add `uploadImage` in `ProductService`.
7. Integrate create/update flow sequencing.
8. Verify catalog/detail/cart/order image rendering + placeholder.
9. Align mock handlers.
10. Run targeted tests, then broader relevant suites.

## Primary files to touch

Backend:

- `onlineshopapi/src/main/resources/application.yml`
- `onlineshopapi/src/main/java/msg/onlineshopapi/controller/ProductController.java`
- `onlineshopapi/src/main/java/msg/onlineshopapi/service/ProductService.java`
- `onlineshopapi/src/main/java/msg/onlineshopapi/exception/GlobalExceptionHandler.java`
- `onlineshopapi/src/main/java/msg/onlineshopapi/security/SecurityConfig.java`
- product image storage/config classes + tests

Frontend:

- `onlineshopui/src/app/features/products/components/views/product-form/product-form.component.ts`
- `onlineshopui/src/app/features/products/components/views/product-form/product-form.component.html`
- `onlineshopui/src/app/features/products/utils/product-form.utils.ts`
- `onlineshopui/src/app/features/products/types/product-form.types.ts`
- `onlineshopui/src/app/features/products/services/product.service.ts`
- create/update page components + specs
- product card/detail components + specs
- product mock handlers + specs

