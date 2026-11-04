package msg.onlineshopapi.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDto {

    private String country;
    private String city;
    private String county;
    private String streetAddress;
}
