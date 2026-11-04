package msg.onlineshopapi.service.strategy;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.exception.OrderNotProcessableException;
import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.Stock;
import msg.onlineshopapi.repository.StockRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class MostAbundantStrategy implements OrderStrategy {

    private final StockRepository stockRepository;

    @Override
    public List<Stock> findStocks(Set<OrderDetail> orderDetails) {
        List<UUID> productIds = orderDetails.stream().map(d -> d.getProduct().getId()).toList();
        Map<UUID, Stock> bestByProduct = findBestStockPerProduct(productIds);
        return orderDetails.stream()
                .map(detail -> resolveStock(detail, bestByProduct))
                .toList();
    }

    private Map<UUID, Stock> findBestStockPerProduct(List<UUID> productIds) {
        return stockRepository.findMaxStockLocations(productIds).stream()
                .collect(Collectors.toMap(
                        s -> s.getProduct().getId(),
                        s -> s,
                        (a, b) -> a
                ));
    }

    private Stock resolveStock(OrderDetail detail, Map<UUID, Stock> bestByProduct) {
        return Optional.ofNullable(bestByProduct.get(detail.getProduct().getId()))
                .filter(s -> s.getQuantity() >= detail.getQuantity())
                .orElseThrow(() -> new OrderNotProcessableException(
                        "No location found with sufficient stock for product: " + detail.getProduct().getId()));
    }
}
