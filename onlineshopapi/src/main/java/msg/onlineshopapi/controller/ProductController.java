package msg.onlineshopapi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.dto.ProductRequestDto;
import msg.onlineshopapi.dto.ProductResponseDto;
import msg.onlineshopapi.dto.mapper.ProductMapper;
import msg.onlineshopapi.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product management")
public class ProductController {

    private final ProductService productService;
    private final ProductMapper productMapper;

    @GetMapping
    @Operation(summary = "Get all products", description = "Returns a list of all products.")
    @ApiResponse(responseCode = "200", description = "Products retrieved successfully")
    public List<ProductResponseDto> getAll() {
        return productService.findAll().stream()
                .map(productMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Returns a single product by its ID.")
    @ApiResponse(responseCode = "200", description = "Product found")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ResponseEntity<ProductResponseDto> getById(@Parameter(description = "Product ID") @PathVariable UUID id) {
        return productService.findById(id)
                .map(productMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a product", description = "Creates a new product. Requires ADMIN role.")
    @ApiResponse(responseCode = "200", description = "Product created successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ProductResponseDto create(@RequestBody ProductRequestDto dto) {
        return productMapper.toDto(productService.save(productMapper.toEntity(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a product", description = "Updates an existing product. Requires ADMIN role.")
    @ApiResponse(responseCode = "200", description = "Product updated successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Product not found")
    public ProductResponseDto update(@Parameter(description = "Product ID") @PathVariable UUID id, @RequestBody ProductRequestDto dto) {
        return productMapper.toDto(productService.update(id, productMapper.toEntity(dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a product", description = "Deletes a product. Requires ADMIN role.")
    @ApiResponse(responseCode = "204", description = "Product deleted successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<Void> delete(@Parameter(description = "Product ID") @PathVariable UUID id) {
        productService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
