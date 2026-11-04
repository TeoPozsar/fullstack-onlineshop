package msg.onlineshopapi.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {

    private UUID id;
    private UUID userId;
    private LocalDateTime createdAt;
    private AddressDto address;
    private List<OrderDetailResponseDto> details;
}
