import { ProductDto } from './product.dto';

export type ProductEventAction = 'CREATED' | 'UPDATED' | 'DELETED';

export type ProductEventDto = {
    eventId: string;
    action: ProductEventAction;
    productId: string;
    occurredAt: string;
    product: ProductDto | null;
};
