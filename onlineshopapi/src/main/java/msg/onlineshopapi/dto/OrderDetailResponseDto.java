package msg.onlineshopapi.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponseDto {

    private UUID orderId;
    private ProductResponseDto product;
    private LocationResponseDto shippedFrom;
    private Integer quantity;
}
