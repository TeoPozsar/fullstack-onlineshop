package msg.onlineshopapi.service;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.exception.ResourceNotFoundException;
import msg.onlineshopapi.model.ProductCategory;
import msg.onlineshopapi.repository.ProductCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryRepository productCategoryRepository;

    public List<ProductCategory> findAll() {
        return productCategoryRepository.findAll();
    }

    public Optional<ProductCategory> findById(UUID id) {
        return productCategoryRepository.findById(id);
    }

    public ProductCategory save(ProductCategory category) {
        return productCategoryRepository.save(category);
    }

    public ProductCategory update(UUID id, ProductCategory category) {
        ProductCategory existing = productCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product category not found with id: " + id));
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        return productCategoryRepository.save(existing);
    }

    public void deleteById(UUID id) {
        productCategoryRepository.deleteById(id);
    }
}
