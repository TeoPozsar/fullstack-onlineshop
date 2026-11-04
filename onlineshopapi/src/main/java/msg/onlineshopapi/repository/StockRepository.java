package msg.onlineshopapi.repository;

import msg.onlineshopapi.model.Stock;
import msg.onlineshopapi.model.StockId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StockRepository extends JpaRepository<Stock, StockId> {

    @Query("""
            SELECT s FROM Stock s
            WHERE s.product.id IN :productIds
            AND s.quantity = (
                SELECT MAX(s2.quantity) FROM Stock s2
                WHERE s2.product.id = s.product.id
            )
            """)
    List<Stock> findMaxStockLocations(@Param("productIds") List<UUID> productIds);

    @Query("""
            SELECT s.location.id FROM Stock s
            WHERE s.product.id IN :productIds
            GROUP BY s.location.id
            HAVING COUNT(DISTINCT s.product.id) = :productCount
            ORDER BY s.location.id ASC
            """)
    List<UUID> findLocationIdsHavingAllProducts(@Param("productIds") List<UUID> productIds,
                                                @Param("productCount") long productCount);

    @Query("SELECT s FROM Stock s WHERE s.location.id IN :locationIds AND s.product.id IN :productIds")
    List<Stock> findByLocationIdInAndProductIdIn(@Param("locationIds") List<UUID> locationIds,
                                                 @Param("productIds") List<UUID> productIds);
}
