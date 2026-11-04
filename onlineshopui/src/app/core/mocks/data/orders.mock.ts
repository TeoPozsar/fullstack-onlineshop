import { OrderDto } from '../../types/dtos/order.dto';
import { MOCK_PRODUCTS } from './products.mock';

export const MOCK_ORDERS: OrderDto[] = [
    {
        id: 'order-1001',
        userId: 'user-1',
        createdAt: '2024-06-18',
        address: {
            country: 'USA',
            city: 'Seattle',
            county: 'King',
            streetAddress: '123 Pine Street'
        },
        details: [
            {
                orderId: 'order-1001',
                product: MOCK_PRODUCTS[0],
                shippedFrom: {
                    id: 'loc-1',
                    name: 'West Coast Warehouse',
                    address: {
                        country: 'USA',
                        city: 'Portland',
                        county: 'Multnomah',
                        streetAddress: '44 Burnside Ave'
                    }
                },
                quantity: 1
            },
            {
                orderId: 'order-1001',
                product: MOCK_PRODUCTS[3],
                shippedFrom: {
                    id: 'loc-2',
                    name: 'North Hub',
                    address: {
                        country: 'USA',
                        city: 'Tacoma',
                        county: 'Pierce',
                        streetAddress: '980 Dock Road'
                    }
                },
                quantity: 2
            }
        ]
    },
    {
        id: 'order-1002',
        userId: 'user-1',
        createdAt: '2024-07-02',
        address: {
            country: 'USA',
            city: 'Seattle',
            county: 'King',
            streetAddress: '123 Pine Street'
        },
        details: [
            {
                orderId: 'order-1002',
                product: MOCK_PRODUCTS[7],
                shippedFrom: {
                    id: 'loc-3',
                    name: 'Central Warehouse',
                    address: {
                        country: 'USA',
                        city: 'Boise',
                        county: 'Ada',
                        streetAddress: '302 River Lane'
                    }
                },
                quantity: 1
            }
        ]
    }
];
