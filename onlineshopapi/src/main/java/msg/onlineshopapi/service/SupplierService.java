package msg.onlineshopapi.service;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.model.Supplier;
import msg.onlineshopapi.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<Supplier> findAll() {
        return supplierRepository.findAll();
    }

    public Optional<Supplier> findById(UUID id) {
        return supplierRepository.findById(id);
    }
}
