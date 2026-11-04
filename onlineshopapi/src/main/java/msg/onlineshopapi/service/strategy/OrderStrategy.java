package msg.onlineshopapi.service.strategy;

import msg.onlineshopapi.model.OrderDetail;
import msg.onlineshopapi.model.Stock;

import java.util.List;
import java.util.Set;

public interface OrderStrategy {

    List<Stock> findStocks(Set<OrderDetail> orderDetails);
}
