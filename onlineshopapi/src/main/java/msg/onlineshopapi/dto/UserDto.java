package msg.onlineshopapi.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
