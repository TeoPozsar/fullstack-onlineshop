package msg.onlineshopapi.service.strategy;

import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.Stock;

import java.util.List;
import java.util.Set;

public interface OrderStrategy {

    /**
     * Finds the stock rows needed to fulfil the requested products.
     * Results are grouped by product and ordered by available quantity descending within each group.
     * A strategy validates total availability, while the order service determines the quantity allocated
     * from each returned stock row.
     */
    List<Stock> findStocks(Set<OrderDetail> orderDetails);
}
