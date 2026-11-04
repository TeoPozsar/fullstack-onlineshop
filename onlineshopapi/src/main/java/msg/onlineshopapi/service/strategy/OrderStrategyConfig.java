package msg.onlineshopapi.service.strategy;

import lombok.RequiredArgsConstructor;
import msg.onlineshopapi.repository.StockRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class OrderStrategyConfig {

    public enum Strategy {
        SINGLE_LOCATION, MOST_ABUNDANT
    }

    @Value("${app.order.strategy}")
    private Strategy orderStrategy;

    private final StockRepository stockRepository;

    @Bean
    public OrderStrategy orderStrategy() {
        if (orderStrategy == Strategy.MOST_ABUNDANT) {
            return new MostAbundantStrategy(stockRepository);
        }
        return new SingleLocationStrategy(stockRepository);
    }
}
