package msg.onlineshopapi.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDto {

    @NotEmpty
    @Valid
    private List<OrderItemRequestDto> items;

    @NotNull
    @Valid
    private AddressDto address;
}
