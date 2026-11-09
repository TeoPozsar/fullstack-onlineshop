package msg.onlineshopapi.controller;

import msg.onlineshopapi.config.TestSecurityConfig;
import msg.onlineshopapi.dto.SupplierDto;
import msg.onlineshopapi.dto.mapper.SupplierMapper;
import msg.onlineshopapi.model.Supplier;
import msg.onlineshopapi.security.JwtService;
import msg.onlineshopapi.service.SupplierService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SupplierController.class)
@Import({TestSecurityConfig.class, SupplierControllerTest.SecurityConfig.class})
class SupplierControllerTest {

    @TestConfiguration
    @EnableWebSecurity
    static class SecurityConfig {

        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(csrf -> csrf.disable())
                    .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(
                            new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                    .build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SupplierService supplierService;

    @MockitoBean
    private SupplierMapper supplierMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private final UUID supplierId = UUID.randomUUID();

    @Test
    @WithAnonymousUser
    void getAll_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/suppliers"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAll_returnsSuppliers() throws Exception {
        Supplier supplier = Supplier.builder().id(supplierId).name("TechNova").build();
        when(supplierService.findAll()).thenReturn(List.of(supplier));
        when(supplierMapper.toDto(supplier)).thenReturn(supplierDto());

        mockMvc.perform(get("/suppliers").with(user("customer@example.com").roles("CUSTOMER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(supplierId.toString()))
                .andExpect(jsonPath("$[0].name").value("TechNova"));
    }

    @Test
    void getById_returnsSupplier_whenFound() throws Exception {
        Supplier supplier = Supplier.builder().id(supplierId).name("TechNova").build();
        when(supplierService.findById(supplierId)).thenReturn(Optional.of(supplier));
        when(supplierMapper.toDto(supplier)).thenReturn(supplierDto());

        mockMvc.perform(get("/suppliers/{id}", supplierId).with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(supplierId.toString()))
                .andExpect(jsonPath("$.name").value("TechNova"));
    }

    @Test
    void getById_returns404_whenNotFound() throws Exception {
        when(supplierService.findById(supplierId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/suppliers/{id}", supplierId).with(user("customer@example.com").roles("CUSTOMER")))
                .andExpect(status().isNotFound());
    }

    @Test
    void writeMethods_areNotAvailable() throws Exception {
        mockMvc.perform(post("/suppliers").with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(put("/suppliers/{id}", supplierId).with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(patch("/suppliers/{id}", supplierId).with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(delete("/suppliers/{id}", supplierId)
                        .with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isMethodNotAllowed());
    }

    private SupplierDto supplierDto() {
        return SupplierDto.builder()
                .id(supplierId)
                .name("TechNova")
                .contactEmail("sales@example.com")
                .phone("+40 264 555 0101")
                .country("Romania")
                .city("Cluj-Napoca")
                .streetAddress("Strada Fabricii 25")
                .build();
    }
}
