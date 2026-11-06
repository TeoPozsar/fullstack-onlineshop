package msg.onlineshopapi.unit.mapper;

import msg.onlineshopapi.dto.ProductRequestDto;
import msg.onlineshopapi.dto.SupplierDto;
import msg.onlineshopapi.dto.mapper.ProductCategoryMapper;
import msg.onlineshopapi.dto.mapper.ProductMapper;
import msg.onlineshopapi.dto.mapper.SupplierMapper;
import msg.onlineshopapi.model.Product;
import msg.onlineshopapi.model.ProductCategory;
import msg.onlineshopapi.model.Supplier;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ProductMapperTest {

    private final ProductMapper productMapper = new ProductMapper(
            new ProductCategoryMapper(), new SupplierMapper());

    @Test
    void toDto_mapsSupplier() {
        UUID supplierId = UUID.randomUUID();
        Product product = Product.builder()
                .category(ProductCategory.builder().id(UUID.randomUUID()).name("Electronics").build())
                .supplier(Supplier.builder()
                        .id(supplierId)
                        .name("TechNova")
                        .contactEmail("sales@example.com")
                        .phone("+40 264 555 0101")
                        .country("Romania")
                        .city("Cluj-Napoca")
                        .streetAddress("Strada Fabricii 25")
                        .build())
                .build();

        assertThat(productMapper.toDto(product).getSupplier())
                .usingRecursiveComparison()
                .isEqualTo(SupplierDto.builder()
                        .id(supplierId)
                        .name("TechNova")
                        .contactEmail("sales@example.com")
                        .phone("+40 264 555 0101")
                        .country("Romania")
                        .city("Cluj-Napoca")
                        .streetAddress("Strada Fabricii 25")
                        .build());
    }

    @Test
    void toEntity_mapsSupplierId() {
        UUID supplierId = UUID.randomUUID();
        Product product = productMapper.toEntity(ProductRequestDto.builder().supplierId(supplierId).build());

        assertThat(product.getSupplier().getId()).isEqualTo(supplierId);
    }
}
