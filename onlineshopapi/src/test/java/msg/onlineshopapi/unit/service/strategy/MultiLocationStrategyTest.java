package msg.onlineshopapi.unit.service.strategy;

import msg.onlineshopapi.exception.OrderNotProcessableException;
import msg.onlineshopapi.model.Location;
import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.Product;
import msg.onlineshopapi.model.Stock;
import msg.onlineshopapi.model.StockId;
import msg.onlineshopapi.repository.StockRepository;
import msg.onlineshopapi.service.strategy.MultiLocationStrategy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyList;

@ExtendWith(MockitoExtension.class)
class MultiLocationStrategyTest {

    @Mock
    private StockRepository stockRepository;

    @InjectMocks
    private MultiLocationStrategy strategy;

    @Test
    void findStocks_selectsMostAbundantFirst_whenOneLocationIsSufficient() {
        Product product = product();
        Stock smaller = stock(product, location(UUID.randomUUID()), 5);
        Stock larger = stock(product, location(UUID.randomUUID()), 10);
        when(stockRepository.findByProductIdIn(List.of(product.getId()))).thenReturn(List.of(smaller, larger));

        assertThat(strategy.findStocks(Set.of(orderDetail(product, 8)))).containsExactly(larger);
    }

    @Test
    void findStocks_splitsAcrossLocations_whenMostAbundantIsInsufficient() {
        Product product = product();
        Stock first = stock(product, location(UUID.randomUUID()), 7);
        Stock second = stock(product, location(UUID.randomUUID()), 4);
        when(stockRepository.findByProductIdIn(List.of(product.getId()))).thenReturn(List.of(second, first));

        assertThat(strategy.findStocks(Set.of(orderDetail(product, 10)))).containsExactly(first, second);
    }

    @Test
    void findStocks_selectsOnlyRequiredLocations_whenSeveralLocationsExist() {
        Product product = product();
        Stock first = stock(product, location(UUID.randomUUID()), 8);
        Stock second = stock(product, location(UUID.randomUUID()), 5);
        Stock third = stock(product, location(UUID.randomUUID()), 3);
        when(stockRepository.findByProductIdIn(List.of(product.getId())))
                .thenReturn(List.of(third, first, second));

        assertThat(strategy.findStocks(Set.of(orderDetail(product, 10)))).containsExactly(first, second);
    }

    @Test
    void findStocks_throwsException_whenTotalStockIsInsufficient() {
        Product product = product();
        when(stockRepository.findByProductIdIn(List.of(product.getId())))
                .thenReturn(List.of(stock(product, location(UUID.randomUUID()), 2)));

        assertThatThrownBy(() -> strategy.findStocks(Set.of(orderDetail(product, 5))))
                .isInstanceOf(OrderNotProcessableException.class)
                .hasMessageContaining(product.getId().toString());
    }

    @Test
    void findStocks_throwsException_whenProductHasNoStockRows() {
        Product product = product();
        when(stockRepository.findByProductIdIn(List.of(product.getId()))).thenReturn(List.of());

        assertThatThrownBy(() -> strategy.findStocks(Set.of(orderDetail(product, 1))))
                .isInstanceOf(OrderNotProcessableException.class)
                .hasMessageContaining(product.getId().toString());
    }

    @Test
    void findStocks_processesEachProductIndependently_andBatchesRepositoryCall() {
        Product firstProduct = product();
        Product secondProduct = product();
        Stock firstStock = stock(firstProduct, location(UUID.randomUUID()), 4);
        Stock secondStock = stock(secondProduct, location(UUID.randomUUID()), 10);
        when(stockRepository.findByProductIdIn(anyList()))
                .thenReturn(List.of(firstStock, secondStock));

        assertThat(strategy.findStocks(Set.of(orderDetail(firstProduct, 3), orderDetail(secondProduct, 8))))
                .containsExactlyInAnyOrder(firstStock, secondStock);
        verify(stockRepository, times(1)).findByProductIdIn(anyList());
    }

    @Test
    void findStocks_breaksEqualQuantityTiesByLocationId() {
        Product product = product();
        UUID lowerId = UUID.randomUUID();
        UUID higherId = UUID.randomUUID();
        if (lowerId.compareTo(higherId) > 0) {
            UUID temporary = lowerId;
            lowerId = higherId;
            higherId = temporary;
        }
        Stock lower = stock(product, location(lowerId), 5);
        Stock higher = stock(product, location(higherId), 5);
        when(stockRepository.findByProductIdIn(List.of(product.getId()))).thenReturn(List.of(higher, lower));

        assertThat(strategy.findStocks(Set.of(orderDetail(product, 6)))).containsExactly(lower, higher);
    }

    private Product product() {
        return Product.builder().id(UUID.randomUUID()).name("Product").build();
    }

    private Location location(UUID id) {
        return Location.builder().id(id).name("Warehouse").build();
    }

    private Stock stock(Product product, Location location, int quantity) {
        return Stock.builder()
                .id(StockId.builder().productId(product.getId()).locationId(location.getId()).build())
                .product(product)
                .location(location)
                .quantity(quantity)
                .build();
    }

    private OrderDetail orderDetail(Product product, int quantity) {
        return OrderDetail.builder().product(product).quantity(quantity).build();
    }
}
