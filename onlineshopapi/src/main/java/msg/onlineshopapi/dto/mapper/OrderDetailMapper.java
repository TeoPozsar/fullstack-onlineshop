package msg.onlineshopapi.dto.mapper;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.dto.OrderDetailResponseDto;
import msg.onlineshopapi.model.OrderDetail;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderDetailMapper {

    private final ProductMapper productMapper;
    private final LocationMapper locationMapper;

    public OrderDetailResponseDto toDto(OrderDetail detail) {
        return OrderDetailResponseDto.builder()
                .orderId(detail.getOrder().getId())
                .product(productMapper.toDto(detail.getProduct()))
                .shippedFrom(locationMapper.toDto(detail.getShippedFrom()))
                .quantity(detail.getQuantity())
                .build();
    }
}
