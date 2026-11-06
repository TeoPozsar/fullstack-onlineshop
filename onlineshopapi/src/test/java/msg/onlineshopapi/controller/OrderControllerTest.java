package msg.onlineshopapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import msg.onlineshopapi.config.TestSecurityConfig;
import msg.onlineshopapi.dto.AddressDto;
import msg.onlineshopapi.dto.OrderItemRequestDto;
import msg.onlineshopapi.dto.OrderRequestDto;
import msg.onlineshopapi.dto.OrderResponseDto;
import msg.onlineshopapi.dto.mapper.OrderMapper;
import msg.onlineshopapi.exception.OrderNotProcessableException;
import msg.onlineshopapi.model.Order;
import msg.onlineshopapi.security.JwtService;
import msg.onlineshopapi.service.OrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@Import(TestSecurityConfig.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private OrderMapper orderMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private final UUID orderId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final UUID productId = UUID.randomUUID();

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getAll_returnsOrders() throws Exception {
        Order order = Order.builder().id(orderId).build();
        OrderResponseDto dto = orderResponse(orderId);

        when(orderService.findAll()).thenReturn(List.of(order));
        when(orderMapper.toDto(order)).thenReturn(dto);

        mockMvc.perform(get("/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(orderId.toString()));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getById_returnsOrder_whenFound() throws Exception {
        Order order = Order.builder().id(orderId).build();
        OrderResponseDto dto = orderResponse(orderId);

        when(orderService.findById(orderId)).thenReturn(Optional.of(order));
        when(orderMapper.toDto(order)).thenReturn(dto);

        mockMvc.perform(get("/orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId.toString()));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getById_returns404_whenNotFound() throws Exception {
        when(orderService.findById(orderId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/orders/{id}", orderId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = "CUSTOMER")
    void create_returnsOrder() throws Exception {
        OrderRequestDto request = orderRequest(address("USA", "Seattle", "King", "123 Pine Street"));
        Order entity = Order.builder().build();
        Order saved = Order.builder().id(orderId).build();
        OrderResponseDto dto = orderResponse(orderId);

        when(orderMapper.toEntity(any(OrderRequestDto.class))).thenReturn(entity);
        when(orderService.createOrder(eq(entity), eq("customer@test.com"))).thenReturn(saved);
        when(orderMapper.toDto(saved)).thenReturn(dto);

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(() -> "customer@test.com"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(orderId.toString()));

        verify(orderMapper).toEntity(any(OrderRequestDto.class));
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = "CUSTOMER")
    void create_returns400_whenAddressIsMissing() throws Exception {
        OrderRequestDto request = OrderRequestDto.builder()
                .items(List.of(OrderItemRequestDto.builder()
                        .productId(productId).quantity(2).build()))
                .build();

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(() -> "customer@test.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value(containsString("address")));

        verifyNoInteractions(orderMapper, orderService);
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = "CUSTOMER")
    void create_returns400_whenAddressFieldIsBlank() throws Exception {
        OrderRequestDto request = orderRequest(address("USA", " ", "King", "123 Pine Street"));

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(() -> "customer@test.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value(containsString("address.city")));

        verifyNoInteractions(orderMapper, orderService);
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = "CUSTOMER")
    void create_returns400_whenAddressFieldIsOverlong() throws Exception {
        OrderRequestDto request = orderRequest(address("C".repeat(101), "Seattle", "King", "123 Pine Street"));

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(() -> "customer@test.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value(containsString("address.country")));

        verifyNoInteractions(orderMapper, orderService);
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = "CUSTOMER")
    void create_returns400_whenStreetAddressIsOverlong() throws Exception {
        OrderRequestDto request = orderRequest(address(
                "USA",
                "Seattle",
                "King",
                "S".repeat(256)
        ));

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(() -> "customer@test.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value(containsString("address.streetAddress")));

        verifyNoInteractions(orderMapper, orderService);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(ints = {0, -1})
    @WithMockUser(username = "customer@test.com", roles = "CUSTOMER")
    void create_returns400_whenQuantityIsNotPositive(Integer quantity) throws Exception {
        OrderRequestDto request = orderRequest(address("USA", "Seattle", "King", "123 Pine Street"));
        request.setItems(List.of(OrderItemRequestDto.builder()
                .productId(productId)
                .quantity(quantity)
                .build()));

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(() -> "customer@test.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(containsString("quantity")));

        verifyNoInteractions(orderMapper, orderService);
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = "CUSTOMER")
    void create_returns400_whenItemsAreEmpty() throws Exception {
        OrderRequestDto request = orderRequest(address("USA", "Seattle", "King", "123 Pine Street"));
        request.setItems(List.of());

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(() -> "customer@test.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(containsString("items")));

        verifyNoInteractions(orderMapper, orderService);
    }

    @Test
    @WithMockUser(username = "customer@test.com", roles = "CUSTOMER")
    void create_returns422_whenOrderNotProcessable() throws Exception {
        OrderRequestDto request = orderRequest(address("USA", "Seattle", "King", "123 Pine Street"));
        request.setItems(List.of(OrderItemRequestDto.builder()
                .productId(productId).quantity(999).build()));
        Order entity = Order.builder().build();

        when(orderMapper.toEntity(any(OrderRequestDto.class))).thenReturn(entity);
        when(orderService.createOrder(eq(entity), eq("customer@test.com")))
                .thenThrow(new OrderNotProcessableException("Insufficient stock"));

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .principal(() -> "customer@test.com"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.error").value("Insufficient stock"));
    }

    private OrderRequestDto orderRequest(AddressDto address) {
        return OrderRequestDto.builder()
                .items(List.of(OrderItemRequestDto.builder()
                        .productId(productId).quantity(2).build()))
                .address(address)
                .build();
    }

    private AddressDto address(String country, String city, String county, String streetAddress) {
        return AddressDto.builder()
                .country(country)
                .city(city)
                .county(county)
                .streetAddress(streetAddress)
                .build();
    }

    private OrderResponseDto orderResponse(UUID id) {
        return OrderResponseDto.builder()
                .id(id)
                .userId(userId)
                .createdAt(LocalDateTime.of(2026, 3, 23, 12, 0))
                .details(List.of())
                .build();
    }
}
