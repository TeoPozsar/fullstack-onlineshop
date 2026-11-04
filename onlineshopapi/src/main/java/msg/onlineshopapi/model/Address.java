package msg.onlineshopapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    private String country;
    private String city;
    private String county;

    @Column(name = "street_address")
    private String streetAddress;
}
