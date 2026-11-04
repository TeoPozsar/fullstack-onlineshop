package msg.onlineshopapi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.dto.ProductCategoryDto;
import msg.onlineshopapi.dto.mapper.ProductCategoryMapper;
import msg.onlineshopapi.service.ProductCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products/categories")
@RequiredArgsConstructor
@Tag(name = "Product Categories", description = "Product category management")
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;
    private final ProductCategoryMapper productCategoryMapper;

    @GetMapping
    @Operation(summary = "Get all categories", description = "Returns a list of all product categories.")
    @ApiResponse(responseCode = "200", description = "Categories retrieved successfully")
    public List<ProductCategoryDto> getAll() {
        return productCategoryService.findAll().stream()
                .map(productCategoryMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Returns a single product category by its ID.")
    @ApiResponse(responseCode = "200", description = "Category found")
    @ApiResponse(responseCode = "404", description = "Category not found")
    public ResponseEntity<ProductCategoryDto> getById(@Parameter(description = "Category ID") @PathVariable UUID id) {
        return productCategoryService.findById(id)
                .map(productCategoryMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a category", description = "Creates a new product category.")
    @ApiResponse(responseCode = "200", description = "Category created successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ProductCategoryDto create(@RequestBody ProductCategoryDto dto) {
        return productCategoryMapper.toDto(productCategoryService.save(productCategoryMapper.toEntity(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a category", description = "Updates an existing product category. Requires ADMIN role.")
    @ApiResponse(responseCode = "200", description = "Category updated successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Category not found")
    public ProductCategoryDto update(@Parameter(description = "Category ID") @PathVariable UUID id, @RequestBody ProductCategoryDto dto) {
        return productCategoryMapper.toDto(productCategoryService.update(id, productCategoryMapper.toEntity(dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a category", description = "Deletes a product category. Requires ADMIN role.")
    @ApiResponse(responseCode = "204", description = "Category deleted successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<Void> delete(@Parameter(description = "Category ID") @PathVariable UUID id) {
        productCategoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
