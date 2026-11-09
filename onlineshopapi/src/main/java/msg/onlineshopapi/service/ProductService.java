package msg.onlineshopapi.service;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.exception.ProductInOrderException;
import msg.onlineshopapi.exception.ResourceNotFoundException;
import msg.onlineshopapi.model.Product;
import msg.onlineshopapi.model.Supplier;
import msg.onlineshopapi.repository.OrderDetailRepository;
import msg.onlineshopapi.repository.ProductRepository;
import msg.onlineshopapi.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final SupplierRepository supplierRepository;

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(UUID id) {
        return productRepository.findById(id);
    }

    @Transactional
    public Product save(Product product) {
        product.setSupplier(requireSupplier(product));
        return productRepository.save(product);
    }

    @Transactional
    public Product update(UUID id, Product product) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setWeight(product.getWeight());
        existing.setCategory(product.getCategory());
        existing.setSupplier(requireSupplier(product));
        existing.setImageUrl(product.getImageUrl());
        return productRepository.save(existing);
    }

    private Supplier requireSupplier(Product product) {
        UUID supplierId = product.getSupplier().getId();
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));
    }

    @Transactional
    public void deleteById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (orderDetailRepository.existsByProduct_Id(id)) {
            throw new ProductInOrderException("Cannot delete product '" + product.getName()
                    + "' because it is referenced by existing orders.");
        }

        productRepository.delete(product);
    }
}
