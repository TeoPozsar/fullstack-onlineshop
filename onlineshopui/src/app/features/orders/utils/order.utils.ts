import { OrderDto } from '../../../core/types/dtos/order.dto';
import { OrderSummary } from '../types/order-summary.type';
import { AppLanguage } from '../../../core/config/constants/i18n.constants';
import { formatCurrency } from '../../../core/utils/locale-format.utils';

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

export function calculateOrderTotal(order: OrderDto | null, lang: AppLanguage): string {
    if (!order?.details?.length) {
        return formatCurrency(0, lang);
    }

    const total = order.details.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    return formatCurrency(total, lang);
}
