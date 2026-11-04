package msg.onlineshopapi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.dto.AuthResponseDto;
import msg.onlineshopapi.dto.LoginRequestDto;
import msg.onlineshopapi.dto.RegisterRequestDto;
import msg.onlineshopapi.dto.UserDto;
import msg.onlineshopapi.dto.mapper.AuthMapper;
import msg.onlineshopapi.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, and profile management")
public class AuthController {

    private final AuthService authService;
    private final AuthMapper userMapper;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user", description = "Creates a new user account")
    @ApiResponse(responseCode = "201", description = "User registered successfully")
    @ApiResponse(responseCode = "400", description = "Invalid registration data")
    public void register(@RequestBody RegisterRequestDto request) {
        authService.register(userMapper.toEntity(request));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", description = "Returns the profile of the authenticated user")
    @ApiResponse(responseCode = "200", description = "Profile retrieved successfully")
    @ApiResponse(responseCode = "401", description = "Not authenticated")
    public UserDto getProfile(Principal principal) {
        return userMapper.toDto(authService.getProfile(principal.getName()));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates a user and returns a JWT token")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    public AuthResponseDto login(@RequestBody LoginRequestDto request) {
        return new AuthResponseDto(authService.login(request.getEmail(), request.getPassword()));
    }
}
