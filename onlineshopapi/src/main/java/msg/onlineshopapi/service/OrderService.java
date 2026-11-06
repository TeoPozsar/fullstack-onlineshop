package msg.onlineshopapi.service;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.exception.ResourceNotFoundException;
import msg.onlineshopapi.exception.OrderNotProcessableException;
import msg.onlineshopapi.model.*;
import msg.onlineshopapi.repository.OrderRepository;
import msg.onlineshopapi.repository.StockRepository;
import msg.onlineshopapi.repository.UserRepository;
import msg.onlineshopapi.service.strategy.OrderStrategy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private record StockAllocation(Stock stock, int quantity) {
    }

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
        validateQuantities(order.getOrderDetails());
        Set<OrderDetail> orderDetails = mergeDuplicateProducts(order.getOrderDetails());
        Map<UUID, Integer> quantityByProduct = orderDetails.stream()
                .collect(Collectors.toMap(d -> d.getProduct().getId(), OrderDetail::getQuantity));

        List<Stock> stocks = orderStrategy.findStocks(orderDetails);
        List<StockAllocation> allocations = allocateStocks(stocks, quantityByProduct);

        order.getOrderDetails().clear();
        orderRepository.save(order);

        order.getOrderDetails().addAll(buildOrderDetails(order, allocations));
        deductStock(allocations);
        return orderRepository.save(order);
    }

    private void validateQuantities(Set<OrderDetail> orderDetails) {
        if (orderDetails.stream().anyMatch(detail ->
                detail.getQuantity() == null || detail.getQuantity() <= 0)) {
            throw new OrderNotProcessableException("Order quantities must be greater than zero");
        }
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

    private List<StockAllocation> allocateStocks(List<Stock> stocks, Map<UUID, Integer> quantityByProduct) {
        Map<UUID, List<Stock>> stocksByProduct = stocks.stream()
                .collect(Collectors.groupingBy(
                        stock -> stock.getProduct().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));
        List<StockAllocation> allocations = new java.util.ArrayList<>();

        for (Map.Entry<UUID, Integer> entry : quantityByProduct.entrySet()) {
            UUID productId = entry.getKey();
            int remaining = entry.getValue();
            if (remaining <= 0) {
                throw new OrderNotProcessableException(
                        "Order quantity must be greater than zero for product: " + productId);
            }
            for (Stock stock : stocksByProduct.getOrDefault(productId, List.of())) {
                if (!productId.equals(stock.getProduct().getId())) {
                    throw new IllegalStateException("Stock does not belong to requested product: " + productId);
                }
                if (stock.getQuantity() <= 0) {
                    continue;
                }
                int allocated = Math.min(remaining, stock.getQuantity());
                allocations.add(new StockAllocation(stock, allocated));
                remaining -= allocated;
                if (remaining <= 0) {
                    break;
                }
            }
            if (remaining > 0) {
                throw new OrderNotProcessableException(
                        "Insufficient total stock for product: " + productId);
            }
        }
        return allocations;
    }

    private Set<OrderDetail> buildOrderDetails(Order order, List<StockAllocation> allocations) {
        return allocations.stream()
                .map(allocation -> {
                    Stock stock = allocation.stock();
                    return OrderDetail.builder()
                            .id(new OrderDetailId(order.getId(), stock.getProduct().getId(),
                                    stock.getLocation().getId()))
                            .order(order)
                            .product(stock.getProduct())
                            .shippedFrom(stock.getLocation())
                            .quantity(allocation.quantity())
                            .build();
                })
                .collect(Collectors.toSet());
    }

    private void deductStock(List<StockAllocation> allocations) {
        for (StockAllocation allocation : allocations) {
            Stock stock = allocation.stock();
            stock.setQuantity(stock.getQuantity() - allocation.quantity());
            stockRepository.save(stock);
        }
    }
}
