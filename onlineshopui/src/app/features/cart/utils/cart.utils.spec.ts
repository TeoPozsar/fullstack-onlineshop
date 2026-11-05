import { AddressDto } from '../../../core/types/dtos/location.dto';
import { CartItem } from '../types/cart-item.type';
import { toCreateOrderDto } from './cart.utils';

describe('toCreateOrderDto', () => {
    const items: CartItem[] = [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 }
    ];
    const address: AddressDto = {
        country: 'USA',
        city: 'Seattle',
        county: 'King',
        streetAddress: '123 Pine Street'
    };

    it('includes the entered address and cart items', () => {
        expect(toCreateOrderDto(items, address)).toEqual({
            address,
            items: [
                { productId: 'product-1', quantity: 2 },
                { productId: 'product-2', quantity: 1 }
            ]
        });
    });

    it('returns null when the cart is empty', () => {
        expect(toCreateOrderDto([], address)).toBeNull();
    });
});
