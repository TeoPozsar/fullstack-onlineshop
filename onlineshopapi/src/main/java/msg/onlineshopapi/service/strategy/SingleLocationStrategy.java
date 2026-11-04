package msg.onlineshopapi.service.strategy;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.exception.OrderNotProcessableException;
import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.Stock;
import msg.onlineshopapi.repository.StockRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class SingleLocationStrategy implements OrderStrategy {

    private final StockRepository stockRepository;

    @Override
    public List<Stock> findStocks(Set<OrderDetail> orderDetails) {
        List<UUID> productIds = orderDetails.stream().map(d -> d.getProduct().getId()).toList();
        Map<UUID, Integer> requiredQuantities = orderDetails.stream()
                .collect(Collectors.toMap(d -> d.getProduct().getId(), OrderDetail::getQuantity));

        List<UUID> candidateLocationIds = findCandidateLocations(productIds);
        Map<UUID, List<Stock>> stocksByLocation = fetchStocksByLocation(candidateLocationIds, productIds);
        UUID selectedLocationId = selectLocation(candidateLocationIds, stocksByLocation, requiredQuantities);

        Map<UUID, Stock> stocksByProduct = stocksByLocation.get(selectedLocationId).stream()
                .collect(Collectors.toMap(s -> s.getProduct().getId(), s -> s));

        return orderDetails.stream()
                .map(detail -> stocksByProduct.get(detail.getProduct().getId()))
                .toList();
    }

    private List<UUID> findCandidateLocations(List<UUID> productIds) {
        List<UUID> candidates = stockRepository.findLocationIdsHavingAllProducts(productIds, productIds.size());
        if (candidates.isEmpty()) {
            throw new OrderNotProcessableException(
                    "No single location found with all required products in sufficient quantity");
        }
        return candidates;
    }

    private Map<UUID, List<Stock>> fetchStocksByLocation(List<UUID> locationIds, List<UUID> productIds) {
        return stockRepository.findByLocationIdInAndProductIdIn(locationIds, productIds).stream()
                .collect(Collectors.groupingBy(s -> s.getLocation().getId()));
    }

    private UUID selectLocation(List<UUID> candidateLocationIds, Map<UUID, List<Stock>> stocksByLocation,
                                Map<UUID, Integer> requiredQuantities) {
        return candidateLocationIds.stream()
                .filter(locationId -> meetsRequirements(stocksByLocation.getOrDefault(locationId, List.of()), requiredQuantities))
                .findFirst()
                .orElseThrow(() -> new OrderNotProcessableException(
                        "No single location found with all required products in sufficient quantity"));
    }

    private boolean meetsRequirements(List<Stock> locationStocks, Map<UUID, Integer> requiredQuantities) {
        Map<UUID, Integer> available = locationStocks.stream()
                .collect(Collectors.toMap(s -> s.getProduct().getId(), Stock::getQuantity));
        return requiredQuantities.entrySet().stream()
                .allMatch(req -> available.getOrDefault(req.getKey(), 0) >= req.getValue());
    }
}
