import { OrderDto } from '../../../core/types/dtos/order.dto';

export type OrderSummary = OrderDto & {
    totalAmount: number;
    totalItems: number;
};
