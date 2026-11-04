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
@Builder
@EqualsAndHashCode
public class StockId implements Serializable {

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "location_id")
    private UUID locationId;
}
