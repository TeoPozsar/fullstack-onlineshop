package msg.onlineshopapi.repository;

import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.OrderDetailId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, OrderDetailId> {

    boolean existsByProduct_Id(UUID productId);
}
