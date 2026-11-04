package msg.onlineshopapi.unit.service.strategy;

import msg.onlineshopapi.exception.OrderNotProcessableException;
import msg.onlineshopapi.model.Location;
import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.Product;
import msg.onlineshopapi.model.Stock;
import msg.onlineshopapi.model.StockId;
import msg.onlineshopapi.repository.StockRepository;
import msg.onlineshopapi.service.strategy.SingleLocationStrategy;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SingleLocationStrategyTest {

    @Mock
    private StockRepository stockRepository;

    @InjectMocks
    private SingleLocationStrategy strategy;

    @Test
    void findStocks_returnsStocksFromSingleLocation_whenAllRequirementsMet() {
        UUID phoneId = UUID.randomUUID();
        UUID laptopId = UUID.randomUUID();
        UUID warehouseId = UUID.randomUUID();
        Product phone = product(phoneId);
        Product laptop = product(laptopId);
        Location warehouse = location(warehouseId);
        Stock phoneStock = stock(phone, warehouse, 10);
        Stock laptopStock = stock(laptop, warehouse, 10);

        when(stockRepository.findLocationIdsHavingAllProducts(anyList(), eq(2L)))
                .thenReturn(List.of(warehouseId));
        when(stockRepository.findByLocationIdInAndProductIdIn(anyList(), anyList()))
                .thenReturn(List.of(phoneStock, laptopStock));

        List<Stock> result = strategy.findStocks(Set.of(orderDetail(phone, 5), orderDetail(laptop, 3)));

        assertThat(result).hasSize(2).containsExactlyInAnyOrder(phoneStock, laptopStock);
    }

    @Test
    void findStocks_throwsException_whenNoLocationHasAllProducts() {
        UUID phoneId = UUID.randomUUID();
        Product phone = product(phoneId);

        when(stockRepository.findLocationIdsHavingAllProducts(anyList(), eq(1L)))
                .thenReturn(List.of());

        assertThatThrownBy(() -> strategy.findStocks(Set.of(orderDetail(phone, 5))))
                .isInstanceOf(OrderNotProcessableException.class);
    }

    @Test
    void findStocks_throwsException_whenCandidateLocationHasInsufficientQuantity() {
        UUID phoneId = UUID.randomUUID();
        UUID warehouseId = UUID.randomUUID();
        Product phone = product(phoneId);
        Location warehouse = location(warehouseId);
        Stock phoneStock = stock(phone, warehouse, 2);

        when(stockRepository.findLocationIdsHavingAllProducts(anyList(), eq(1L)))
                .thenReturn(List.of(warehouseId));
        when(stockRepository.findByLocationIdInAndProductIdIn(anyList(), anyList()))
                .thenReturn(List.of(phoneStock));

        assertThatThrownBy(() -> strategy.findStocks(Set.of(orderDetail(phone, 5))))
                .isInstanceOf(OrderNotProcessableException.class);
    }

    @Test
    void findStocks_skipsFirstCandidate_whenItHasInsufficientQuantityForOneProduct() {
        UUID phoneId = UUID.randomUUID();
        UUID laptopId = UUID.randomUUID();
        UUID warehouseId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();
        Product phone = product(phoneId);
        Product laptop = product(laptopId);
        Location warehouse = location(warehouseId);
        Location store = location(storeId);

        Stock warehousePhone = stock(phone, warehouse, 10);
        Stock warehouseLaptop = stock(laptop, warehouse, 1);

        Stock storePhone = stock(phone, store, 8);
        Stock storeLaptop = stock(laptop, store, 10);

        when(stockRepository.findLocationIdsHavingAllProducts(anyList(), eq(2L)))
                .thenReturn(List.of(warehouseId, storeId));
        when(stockRepository.findByLocationIdInAndProductIdIn(anyList(), anyList()))
                .thenReturn(List.of(warehousePhone, warehouseLaptop, storePhone, storeLaptop));

        List<Stock> result = strategy.findStocks(Set.of(orderDetail(phone, 5), orderDetail(laptop, 5)));

        assertThat(result).containsExactlyInAnyOrder(storePhone, storeLaptop);
        assertThat(result).allSatisfy(s ->
                assertThat(s.getLocation().getId()).isEqualTo(storeId));
    }

    @Test
    void findStocks_selectsFirstValidLocation_whenMultipleCandidatesMeetRequirements() {
        UUID phoneId = UUID.randomUUID();
        UUID laptopId = UUID.randomUUID();
        UUID warehouseId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();
        Product phone = product(phoneId);
        Product laptop = product(laptopId);
        Location warehouse = location(warehouseId);
        Location store = location(storeId);

        Stock warehousePhone = stock(phone, warehouse, 10);
        Stock warehouseLaptop = stock(laptop, warehouse, 10);
        Stock storePhone = stock(phone, store, 50);
        Stock storeLaptop = stock(laptop, store, 50);

        when(stockRepository.findLocationIdsHavingAllProducts(anyList(), eq(2L)))
                .thenReturn(List.of(warehouseId, storeId));
        when(stockRepository.findByLocationIdInAndProductIdIn(anyList(), anyList()))
                .thenReturn(List.of(warehousePhone, warehouseLaptop, storePhone, storeLaptop));

        List<Stock> result = strategy.findStocks(Set.of(orderDetail(phone, 5), orderDetail(laptop, 5)));

        assertThat(result).containsExactlyInAnyOrder(warehousePhone, warehouseLaptop);
        assertThat(result).allSatisfy(s ->
                assertThat(s.getLocation().getId()).isEqualTo(warehouseId));
    }

    @Test
    void findStocks_throwsException_whenMultipleProductsSpreadAcrossLocationsButNoneHasAll() {
        UUID phoneId = UUID.randomUUID();
        UUID laptopId = UUID.randomUUID();
        UUID tabletId = UUID.randomUUID();
        Product phone = product(phoneId);
        Product laptop = product(laptopId);
        Product tablet = product(tabletId);

        when(stockRepository.findLocationIdsHavingAllProducts(anyList(), eq(3L)))
                .thenReturn(List.of());

        assertThatThrownBy(() -> strategy.findStocks(
                Set.of(orderDetail(phone, 1), orderDetail(laptop, 1), orderDetail(tablet, 1))))
                .isInstanceOf(OrderNotProcessableException.class);
    }

    @Test
    void findStocks_throwsException_whenAllCandidateLocationsHaveInsufficientQuantity() {
        UUID phoneId = UUID.randomUUID();
        UUID laptopId = UUID.randomUUID();
        UUID warehouseId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();
        Product phone = product(phoneId);
        Product laptop = product(laptopId);
        Location warehouse = location(warehouseId);
        Location store = location(storeId);

        Stock warehousePhone = stock(phone, warehouse, 2);
        Stock warehouseLaptop = stock(laptop, warehouse, 1);
        Stock storePhone = stock(phone, store, 3);
        Stock storeLaptop = stock(laptop, store, 2);

        when(stockRepository.findLocationIdsHavingAllProducts(anyList(), eq(2L)))
                .thenReturn(List.of(warehouseId, storeId));
        when(stockRepository.findByLocationIdInAndProductIdIn(anyList(), anyList()))
                .thenReturn(List.of(warehousePhone, warehouseLaptop, storePhone, storeLaptop));

        assertThatThrownBy(() -> strategy.findStocks(
                Set.of(orderDetail(phone, 10), orderDetail(laptop, 10))))
                .isInstanceOf(OrderNotProcessableException.class);
    }

    private Product product(UUID id) {
        return Product.builder().id(id).name("Product").build();
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
