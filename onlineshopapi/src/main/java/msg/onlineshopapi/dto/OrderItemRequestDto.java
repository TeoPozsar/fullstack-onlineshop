package msg.onlineshopapi.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequestDto {

    private UUID productId;
    private Integer quantity;
}
