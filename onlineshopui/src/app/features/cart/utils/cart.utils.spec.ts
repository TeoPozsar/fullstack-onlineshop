import { AddressDto } from '../../../core/types/dtos/location.dto';
import { MOCK_PRODUCTS } from '../../../core/mocks/data/products.mock';
import { CartItem } from '../types/cart-item.type';
import { calculateCartSubtotal, calculateLineTotal, toCreateOrderDto } from './cart.utils';

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

describe('cart calculations', () => {
    it('calculates the subtotal from product prices and quantities', () => {
        const productsById = new Map(MOCK_PRODUCTS.map(product => [product.id, product]));

        expect(
            calculateCartSubtotal(
                [
                    { productId: MOCK_PRODUCTS[0].id, quantity: 2 },
                    { productId: MOCK_PRODUCTS[1].id, quantity: 3 },
                    { productId: 'missing', quantity: 1 }
                ],
                productsById
            )
        ).toBe('1199.95');
    });

    it('calculates line totals with two decimal places', () => {
        expect(calculateLineTotal(3, 4.125)).toBe('12.38');
    });
});
