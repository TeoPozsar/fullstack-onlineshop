package msg.onlineshopapi.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ProductEventDtoTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void serializesDeleteEventWithNullProduct() throws Exception {
        UUID productId = UUID.randomUUID();

        ProductEventDto event = ProductEventDto.deleted(productId);
        ProductEventDto serialized = objectMapper.readValue(
                objectMapper.writeValueAsString(event),
                ProductEventDto.class
        );

        assertEquals(ProductEventAction.DELETED, serialized.action());
        assertEquals(productId, serialized.productId());
        assertNull(serialized.product());
    }
}
