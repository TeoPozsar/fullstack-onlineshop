package msg.onlineshopapi.unit.mapper;

import msg.onlineshopapi.dto.AddressDto;
import msg.onlineshopapi.dto.OrderRequestDto;
import msg.onlineshopapi.dto.mapper.AddressMapper;
import msg.onlineshopapi.dto.mapper.OrderDetailMapper;
import msg.onlineshopapi.dto.mapper.OrderMapper;
import msg.onlineshopapi.model.Address;
import msg.onlineshopapi.model.Order;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class OrderMapperTest {

    private final OrderMapper orderMapper = new OrderMapper(mock(OrderDetailMapper.class), new AddressMapper());

    @Test
    void toEntity_mapsAddress() {
        AddressDto addressDto = AddressDto.builder()
                .country("USA")
                .city("Seattle")
                .county("King")
                .streetAddress("123 Pine Street")
                .build();
        OrderRequestDto request = OrderRequestDto.builder()
                .items(List.of())
                .address(addressDto)
                .build();

        Order order = orderMapper.toEntity(request);

        assertThat(order.getAddress()).usingRecursiveComparison().isEqualTo(Address.builder()
                .country("USA")
                .city("Seattle")
                .county("King")
                .streetAddress("123 Pine Street")
                .build());
    }
}
