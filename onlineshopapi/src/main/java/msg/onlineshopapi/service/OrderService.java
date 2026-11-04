package msg.onlineshopapi.service;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.exception.ResourceNotFoundException;
import msg.onlineshopapi.model.*;
import msg.onlineshopapi.repository.OrderRepository;
import msg.onlineshopapi.repository.StockRepository;
import msg.onlineshopapi.repository.UserRepository;
import msg.onlineshopapi.service.strategy.OrderStrategy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final StockRepository stockRepository;
    private final UserRepository userRepository;
    private final OrderStrategy orderStrategy;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Optional<Order> findById(UUID id) {
        return orderRepository.findById(id);
    }

    @Transactional
    public Order createOrder(Order order, String email) {
        resolveUser(order, email);
        Set<OrderDetail> orderDetails = mergeDuplicateProducts(order.getOrderDetails());
        Map<UUID, Integer> quantityByProduct = orderDetails.stream()
                .collect(Collectors.toMap(d -> d.getProduct().getId(), OrderDetail::getQuantity));

        List<Stock> stocks = orderStrategy.findStocks(orderDetails);

        order.getOrderDetails().clear();
        orderRepository.save(order);

        order.getOrderDetails().addAll(buildOrderDetails(order, stocks, quantityByProduct));
        deductStock(stocks, quantityByProduct);
        return orderRepository.save(order);
    }

    private Set<OrderDetail> mergeDuplicateProducts(Set<OrderDetail> orderDetails) {
        return orderDetails.stream()
                .collect(Collectors.toMap(
                        d -> d.getProduct().getId(),
                        d -> d,
                        (a, b) -> OrderDetail.builder()
                                .product(a.getProduct())
                                .quantity(a.getQuantity() + b.getQuantity())
                                .build()
                ))
                .values()
                .stream()
                .collect(Collectors.toUnmodifiableSet());
    }

    private void resolveUser(Order order, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        order.setUser(user);
    }

    private Set<OrderDetail> buildOrderDetails(Order order, List<Stock> stocks, Map<UUID, Integer> quantityByProduct) {
        return stocks.stream()
                .map(stock -> {
                    int quantity = quantityByProduct.get(stock.getProduct().getId());
                    return OrderDetail.builder()
                            .id(new OrderDetailId(order.getId(), stock.getProduct().getId()))
                            .order(order)
                            .product(stock.getProduct())
                            .shippedFrom(stock.getLocation())
                            .quantity(quantity)
                            .build();
                })
                .collect(Collectors.toSet());
    }

    private void deductStock(List<Stock> stocks, Map<UUID, Integer> quantityByProduct) {
        for (Stock stock : stocks) {
            stock.setQuantity(stock.getQuantity() - quantityByProduct.get(stock.getProduct().getId()));
            stockRepository.save(stock);
        }
    }
}
