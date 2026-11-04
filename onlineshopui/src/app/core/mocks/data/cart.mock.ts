import { CartItem } from '../../../features/cart/types/cart-item.type';

export const MOCK_CART_ITEMS: CartItem[] = [
    {
        productId: 'prod-1',
        quantity: 2
    },
    {
        productId: 'prod-2',
        quantity: 1
    },
    {
        productId: 'prod-3',
        quantity: 3
    }
];

export const MOCK_CART_ITEM_SINGLE: CartItem = {
    productId: 'prod-1',
    quantity: 1
};
