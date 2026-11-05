import { AddressDto } from '../../../types/dtos/location.dto';
import { CreateOrderDto } from '../../../types/dtos/order.dto';
import { handleOrdersFeature } from './orders-handler.mock';

describe('handleOrdersFeature', () => {
    it('returns the submitted address when creating an order', () => {
        const address: AddressDto = {
            country: 'Canada',
            city: 'Vancouver',
            county: 'Metro Vancouver',
            streetAddress: '456 Main Street'
        };
        const request: CreateOrderDto = {
            address,
            items: []
        };

        const response = handleOrdersFeature({
            method: 'POST',
            path: '/orders',
            body: request
        });

        expect(response?.status).toBe(201);
        expect(response?.body).toMatchObject({ address });
    });
});
