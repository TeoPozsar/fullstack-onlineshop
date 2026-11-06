package msg.onlineshopapi.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequestDto {

    private UUID productId;

    @NotNull
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;
}
