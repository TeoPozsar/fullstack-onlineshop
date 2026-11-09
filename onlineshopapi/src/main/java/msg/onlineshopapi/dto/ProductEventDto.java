package msg.onlineshopapi.dto;

import java.time.Instant;
import java.util.UUID;

public record ProductEventDto(
        UUID eventId,
        ProductEventAction action,
        UUID productId,
        Instant occurredAt,
        ProductResponseDto product
) {
    public static ProductEventDto created(ProductResponseDto product) {
        return new ProductEventDto(
                UUID.randomUUID(),
                ProductEventAction.CREATED,
                product.getId(),
                Instant.now(),
                product
        );
    }

    public static ProductEventDto updated(ProductResponseDto product) {
        return new ProductEventDto(
                UUID.randomUUID(),
                ProductEventAction.UPDATED,
                product.getId(),
                Instant.now(),
                product
        );
    }

    public static ProductEventDto deleted(UUID productId) {
        return new ProductEventDto(
                UUID.randomUUID(),
                ProductEventAction.DELETED,
                productId,
                Instant.now(),
                null
        );
    }
}
