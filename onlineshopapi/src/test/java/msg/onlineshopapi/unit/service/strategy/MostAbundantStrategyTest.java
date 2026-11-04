package msg.onlineshopapi.unit.service.strategy;

import msg.onlineshopapi.exception.OrderNotProcessableException;
import msg.onlineshopapi.model.Location;
import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.Product;
import msg.onlineshopapi.model.Stock;
import msg.onlineshopapi.model.StockId;
import msg.onlineshopapi.repository.StockRepository;
import msg.onlineshopapi.service.strategy.MostAbundantStrategy;
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
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MostAbundantStrategyTest {

    @Mock
    private StockRepository stockRepository;

    @InjectMocks
    private MostAbundantStrategy strategy;

    @Test
    void findStocks_returnsMostAbundantStock_whenSufficientQuantityAvailable() {
        UUID productId = UUID.randomUUID();
        Product product = product(productId);
        Stock stock = stock(product, location(), 10);
        OrderDetail detail = orderDetail(product, 5);

        when(stockRepository.findMaxStockLocations(List.of(productId))).thenReturn(List.of(stock));

        List<Stock> result = strategy.findStocks(Set.of(detail));

        assertThat(result).containsExactly(stock);
        verify(stockRepository).findMaxStockLocations(List.of(productId));
    }

    @Test
    void findStocks_throwsException_whenStockQuantityIsInsufficient() {
        UUID productId = UUID.randomUUID();
        Product product = product(productId);
        Stock stock = stock(product, location(), 3);
        OrderDetail detail = orderDetail(product, 5);

        when(stockRepository.findMaxStockLocations(List.of(productId))).thenReturn(List.of(stock));

        assertThatThrownBy(() -> strategy.findStocks(Set.of(detail)))
                .isInstanceOf(OrderNotProcessableException.class)
                .hasMessageContaining(productId.toString());
    }

    @Test
    void findStocks_throwsException_whenNoStockExistsForProduct() {
        UUID productId = UUID.randomUUID();
        Product product = product(productId);
        OrderDetail detail = orderDetail(product, 5);

        when(stockRepository.findMaxStockLocations(List.of(productId))).thenReturn(List.of());

        assertThatThrownBy(() -> strategy.findStocks(Set.of(detail)))
                .isInstanceOf(OrderNotProcessableException.class)
                .hasMessageContaining(productId.toString());
    }

    @Test
    void findStocks_selectsDifferentLocationsPerProduct_whenMostAbundantVaries() {
        UUID phoneId = UUID.randomUUID();
        UUID laptopId = UUID.randomUUID();
        Product phone = product(phoneId);
        Product laptop = product(laptopId);
        Location warehouse = location();
        Location store = location();

        Stock phoneStock = stock(phone, warehouse, 20);
        Stock laptopStock = stock(laptop, store, 15);

        when(stockRepository.findMaxStockLocations(anyList())).thenReturn(List.of(phoneStock, laptopStock));

        List<Stock> result = strategy.findStocks(Set.of(orderDetail(phone, 5), orderDetail(laptop, 10)));

        assertThat(result).containsExactlyInAnyOrder(phoneStock, laptopStock);
        assertThat(result).extracting(s -> s.getLocation().getId())
                .containsExactlyInAnyOrder(warehouse.getId(), store.getId());
    }

    @Test
    void findStocks_throwsException_whenOneOfMultipleProductsHasInsufficientStock() {
        UUID phoneId = UUID.randomUUID();
        UUID laptopId = UUID.randomUUID();
        Product phone = product(phoneId);
        Product laptop = product(laptopId);

        Stock phoneStock = stock(phone, location(), 20);
        Stock laptopStock = stock(laptop, location(), 3);

        when(stockRepository.findMaxStockLocations(anyList())).thenReturn(List.of(phoneStock, laptopStock));

        assertThatThrownBy(() -> strategy.findStocks(Set.of(orderDetail(phone, 5), orderDetail(laptop, 10))))
                .isInstanceOf(OrderNotProcessableException.class)
                .hasMessageContaining(laptopId.toString());
    }

    @Test
    void findStocks_throwsException_whenOneOfMultipleProductsHasNoStock() {
        UUID phoneId = UUID.randomUUID();
        UUID tabletId = UUID.randomUUID();
        Product phone = product(phoneId);
        Product tablet = product(tabletId);

        Stock phoneStock = stock(phone, location(), 20);

        when(stockRepository.findMaxStockLocations(anyList())).thenReturn(List.of(phoneStock));

        assertThatThrownBy(() -> strategy.findStocks(Set.of(orderDetail(phone, 5), orderDetail(tablet, 3))))
                .isInstanceOf(OrderNotProcessableException.class)
                .hasMessageContaining(tabletId.toString());
    }

    private Product product(UUID id) {
        return Product.builder().id(id).name("Product").build();
    }

    private Location location() {
        return Location.builder().id(UUID.randomUUID()).name("Warehouse").build();
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
