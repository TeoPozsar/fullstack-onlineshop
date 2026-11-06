package msg.onlineshopapi.unit.service;

import msg.onlineshopapi.exception.ResourceNotFoundException;
import msg.onlineshopapi.model.Product;
import msg.onlineshopapi.model.Supplier;
import msg.onlineshopapi.repository.OrderDetailRepository;
import msg.onlineshopapi.repository.ProductRepository;
import msg.onlineshopapi.repository.SupplierRepository;
import msg.onlineshopapi.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void save_resolvesSupplierBeforeSavingProduct() {
        Supplier supplier = supplier();
        Product product = product(supplier.getId());
        when(supplierRepository.findById(supplier.getId())).thenReturn(Optional.of(supplier));
        when(productRepository.save(product)).thenReturn(product);

        Product saved = productService.save(product);

        assertThat(saved.getSupplier()).isSameAs(supplier);
        verify(productRepository).save(product);
    }

    @Test
    void save_throwsWhenSupplierDoesNotExist() {
        UUID supplierId = UUID.randomUUID();
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.save(product(supplierId)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Supplier not found with id: " + supplierId);
    }

    @Test
    void update_replacesSupplier() {
        UUID productId = UUID.randomUUID();
        Product existing = Product.builder().id(productId).build();
        Supplier supplier = supplier();
        Product update = product(supplier.getId());
        when(productRepository.findById(productId)).thenReturn(Optional.of(existing));
        when(supplierRepository.findById(supplier.getId())).thenReturn(Optional.of(supplier));
        when(productRepository.save(existing)).thenReturn(existing);

        Product updated = productService.update(productId, update);

        assertThat(updated.getSupplier()).isSameAs(supplier);
        verify(productRepository).save(existing);
    }

    private Supplier supplier() {
        return Supplier.builder().id(UUID.randomUUID()).name("TechNova").build();
    }

    private Product product(UUID supplierId) {
        return Product.builder().supplier(Supplier.builder().id(supplierId).build()).build();
    }
}
