package msg.onlineshopapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class OrderDetailId implements Serializable {

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "product_id")
    private UUID productId;
}
