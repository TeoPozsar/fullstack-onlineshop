package msg.onlineshopapi.dto.mapper;

import msg.onlineshopapi.dto.RegisterRequestDto;
import msg.onlineshopapi.dto.UserDto;
import msg.onlineshopapi.model.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public User toEntity(RegisterRequestDto dto) {
        return User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .build();
    }

    public UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }
}
