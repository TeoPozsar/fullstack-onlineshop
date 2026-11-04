import { OrderDto } from '../../../core/types/dtos/order.dto';
import { OrderSummary } from '../types/order-summary.type';

export function toOrderSummary(order: OrderDto): OrderSummary {
    const totalItems = order.details?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    const totalAmount =
        order.details?.reduce((sum, item) => sum + item.quantity * item.product.price, 0) ?? 0;

    return {
        ...order,
        totalItems,
        totalAmount
    };
}

export function calculateOrderTotal(order: OrderDto | null): string {
    if (!order?.details?.length) {
        return '0.00';
    }

    const total = order.details.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    return total.toFixed(2);
}
