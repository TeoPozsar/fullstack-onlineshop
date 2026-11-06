package msg.onlineshopapi.service.strategy;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.exception.OrderNotProcessableException;
import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.Stock;
import msg.onlineshopapi.repository.StockRepository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class MultiLocationStrategy implements OrderStrategy {

    private final StockRepository stockRepository;

    @Override
    public List<Stock> findStocks(Set<OrderDetail> orderDetails) {
        List<UUID> productIds = orderDetails.stream().map(detail -> detail.getProduct().getId()).toList();
        Map<UUID, List<Stock>> stocksByProduct = stockRepository.findByProductIdIn(productIds).stream()
                .filter(stock -> stock.getQuantity() > 0)
                .collect(Collectors.groupingBy(
                        stock -> stock.getProduct().getId(),
                        Collectors.collectingAndThen(Collectors.toList(), this::sortStocks)));

        return orderDetails.stream()
                .flatMap(detail -> selectStocks(detail, stocksByProduct).stream())
                .toList();
    }

    private List<Stock> sortStocks(List<Stock> stocks) {
        return stocks.stream()
                .sorted(Comparator.comparing(Stock::getQuantity).reversed()
                        .thenComparing(stock -> stock.getLocation().getId()))
                .toList();
    }

    private List<Stock> selectStocks(OrderDetail detail, Map<UUID, List<Stock>> stocksByProduct) {
        UUID productId = detail.getProduct().getId();
        List<Stock> candidates = stocksByProduct.getOrDefault(productId, List.of());
        int remaining = detail.getQuantity();
        List<Stock> selected = new java.util.ArrayList<>();

        for (Stock stock : candidates) {
            selected.add(stock);
            remaining -= stock.getQuantity();
            if (remaining <= 0) {
                return selected;
            }
        }

        throw new OrderNotProcessableException(
                "Insufficient total stock for product: " + productId);
    }
}
