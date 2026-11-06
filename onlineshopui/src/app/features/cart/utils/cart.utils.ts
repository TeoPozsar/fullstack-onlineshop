import { ProductDto } from '../../../core/types/dtos/product.dto';
import { CreateOrderDto } from '../../../core/types/dtos/order.dto';
import { AddressDto } from '../../../core/types/dtos/location.dto';
import { CartItem } from '../types/cart-item.type';
import { AppLanguage } from '../../../core/config/constants/i18n.constants';
import { formatCurrency } from '../../../core/utils/locale-format.utils';

export function buildProductsById(products: ProductDto[]): Map<string, ProductDto> {
    return new Map(products.map(product => [product.id, product]));
}

export function calculateCartSubtotal(
    items: CartItem[],
    productsById: Map<string, ProductDto>,
    lang: AppLanguage
): string {
    const total = items.reduce((sum, item) => {
        const product = productsById.get(item.productId);
        if (!product) return sum;
        return sum + product.price * item.quantity;
    }, 0);

    return formatCurrency(total, lang);
}

export function calculateLineTotal(quantity: number, price: number, lang: AppLanguage): string {
    return formatCurrency(quantity * price, lang);
}

export function toCreateOrderDto(
    items: CartItem[],
    address: AddressDto
): CreateOrderDto | null {
    if (items.length === 0) {
        return null;
    }

    return {
        address,
        items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };
}
