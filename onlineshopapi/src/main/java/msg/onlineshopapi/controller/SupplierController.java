package msg.onlineshopapi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.dto.SupplierDto;
import msg.onlineshopapi.dto.mapper.SupplierMapper;
import msg.onlineshopapi.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Read-only supplier catalogue")
public class SupplierController {

    private final SupplierService supplierService;
    private final SupplierMapper supplierMapper;

    @GetMapping
    @Operation(summary = "Get all suppliers", description = "Returns all available suppliers.")
    @ApiResponse(responseCode = "200", description = "Suppliers retrieved successfully")
    public List<SupplierDto> getAll() {
        return supplierService.findAll().stream()
                .map(supplierMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID", description = "Returns a supplier by its ID.")
    @ApiResponse(responseCode = "200", description = "Supplier found")
    @ApiResponse(responseCode = "404", description = "Supplier not found")
    public ResponseEntity<SupplierDto> getById(@Parameter(description = "Supplier ID") @PathVariable UUID id) {
        return supplierService.findById(id)
                .map(supplierMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
