package msg.onlineshopapi.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDto {

    private List<OrderItemRequestDto> items;
}
