package msg.onlineshopapi.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCategoryDto {

    private UUID id;
    private String name;
    private String description;
}
