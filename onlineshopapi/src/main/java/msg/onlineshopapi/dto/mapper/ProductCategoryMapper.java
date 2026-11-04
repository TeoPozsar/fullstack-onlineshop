package msg.onlineshopapi.dto.mapper;

import msg.onlineshopapi.dto.ProductCategoryDto;
import msg.onlineshopapi.model.ProductCategory;
import org.springframework.stereotype.Component;

@Component
public class ProductCategoryMapper {

    public ProductCategoryDto toDto(ProductCategory category) {
        return ProductCategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }

    public ProductCategory toEntity(ProductCategoryDto dto) {
        return ProductCategory.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }
}
