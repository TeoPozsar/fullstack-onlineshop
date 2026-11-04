package msg.onlineshopapi.unit.service;

import msg.onlineshopapi.exception.ResourceNotFoundException;
import msg.onlineshopapi.model.Location;
import msg.onlineshopapi.model.Order;
import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.Product;
import msg.onlineshopapi.model.Stock;
import msg.onlineshopapi.model.User;
import msg.onlineshopapi.repository.OrderRepository;
import msg.onlineshopapi.repository.StockRepository;
import msg.onlineshopapi.repository.UserRepository;
import msg.onlineshopapi.service.OrderService;
import msg.onlineshopapi.service.strategy.OrderStrategy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private StockRepository stockRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderStrategy orderStrategy;

    @InjectMocks
    private OrderService orderService;

    @Test
    void findAll_returnsOrders_whenRepositoryContainsOrders() {
        List<Order> orders = List.of(Order.builder().build(), Order.builder().build());
        when(orderRepository.findAll()).thenReturn(orders);

        List<Order> result = orderService.findAll();

        assertThat(result).containsExactlyElementsOf(orders);
        verify(orderRepository).findAll();
    }

    @Test
    void findById_returnsOrder_whenRepositoryFindsMatchingId() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder().id(orderId).build();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        Optional<Order> result = orderService.findById(orderId);

        assertThat(result).contains(order);
        verify(orderRepository).findById(orderId);
    }

    @Test
    void createOrder_assignsUserBuildsDetailsAndDeductsStock_whenUserAndStockExist() {
        UUID orderId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        String email = "customer@example.com";
        Product product = product(productId);
        Location location = location();
        Stock stock = stock(product, location, 10);
        User user = User.builder().email(email).build();
        Order order = order(orderId, orderDetail(product, 3));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(orderStrategy.findStocks(anySet())).thenReturn(List.of(stock));
        when(orderRepository.save(order)).thenReturn(order);

        Order result = orderService.createOrder(order, email);

        assertThat(result).isSameAs(order);
        assertThat(order.getUser()).isSameAs(user);
        assertThat(order.getOrderDetails()).singleElement().satisfies(detail -> {
            assertThat(detail.getId().getOrderId()).isEqualTo(orderId);
            assertThat(detail.getId().getProductId()).isEqualTo(productId);
            assertThat(detail.getOrder()).isSameAs(order);
            assertThat(detail.getProduct()).isSameAs(product);
            assertThat(detail.getShippedFrom()).isSameAs(location);
            assertThat(detail.getQuantity()).isEqualTo(3);
        });
        assertThat(stock.getQuantity()).isEqualTo(7);
        verify(orderRepository, times(2)).save(order);
        verify(stockRepository).save(stock);
    }

    @Test
    void createOrder_mergesQuantities_whenOrderContainsDuplicateProducts() {
        UUID orderId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        String email = "customer@example.com";
        Product product = product(productId);
        Stock stock = stock(product, location(), 10);
        Order order = order(orderId, orderDetail(product, 2), orderDetail(product, 3));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(User.builder().email(email).build()));
        when(orderStrategy.findStocks(anySet())).thenAnswer(invocation -> {
            Set<OrderDetail> details = invocation.getArgument(0);
            assertThat(details).singleElement().satisfies(detail ->
                    assertThat(detail.getQuantity()).isEqualTo(5));
            return List.of(stock);
        });
        when(orderRepository.save(order)).thenReturn(order);

        orderService.createOrder(order, email);

        assertThat(order.getOrderDetails()).singleElement().satisfies(detail ->
                assertThat(detail.getQuantity()).isEqualTo(5));
        assertThat(stock.getQuantity()).isEqualTo(5);
        verify(stockRepository).save(stock);
    }

    @Test
    void createOrder_throwsResourceNotFoundException_whenUserDoesNotExist() {
        String email = "missing@example.com";
        Order order = order(UUID.randomUUID(), orderDetail(product(UUID.randomUUID()), 1));

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(order, email))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found with email: " + email);

        verifyNoInteractions(orderRepository, stockRepository, orderStrategy);
    }

    private Order order(UUID id, OrderDetail... details) {
        return Order.builder()
                .id(id)
                .orderDetails(new HashSet<>(Set.of(details)))
                .build();
    }

    private Product product(UUID id) {
        return Product.builder().id(id).name("Product").build();
    }

    private Location location() {
        return Location.builder().id(UUID.randomUUID()).name("Warehouse").build();
    }

    private Stock stock(Product product, Location location, int quantity) {
        return Stock.builder()
                .product(product)
                .location(location)
                .quantity(quantity)
                .build();
    }

    private OrderDetail orderDetail(Product product, int quantity) {
        return OrderDetail.builder().product(product).quantity(quantity).build();
    }
}
