package msg.onlineshopapi.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDto {

    private String firstName;
    private String lastName;
    private String email;
    private String password;
}
