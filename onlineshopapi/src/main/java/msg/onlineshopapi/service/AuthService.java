package msg.onlineshopapi.service;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.model.User;
import msg.onlineshopapi.model.UserRole;
import msg.onlineshopapi.repository.UserRepository;
import msg.onlineshopapi.security.JwtService;
import msg.onlineshopapi.exception.DuplicateResourceException;
import msg.onlineshopapi.exception.ResourceNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public void register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already in use");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(UserRole.CUSTOMER);
        userRepository.save(user);
    }

    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public String login(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
        var userDetails = userDetailsService.loadUserByUsername(email);
        return jwtService.generateToken(userDetails);
    }
}
