package msg.onlineshopapi.dto.mapper;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.dto.LocationResponseDto;
import msg.onlineshopapi.model.Location;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LocationMapper {

    private final AddressMapper addressMapper;

    public LocationResponseDto toDto(Location location) {
        return LocationResponseDto.builder()
                .id(location.getId())
                .name(location.getName())
                .address(addressMapper.toDto(location.getAddress()))
                .build();
    }
}
