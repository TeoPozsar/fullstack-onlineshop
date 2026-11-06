import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CartItem } from '../../../types/cart-item.type';
import { ProductDto } from '../../../../../core/types/dtos/product.dto';
import { CardComponent } from '../../../../../clib/components/card/card.component';
import { IconComponent } from '../../../../../clib/components/icon/icon.component';
import { calculateLineTotal } from '../../../utils/cart.utils';
import { LanguageService } from '../../../../../core/services/language.service';
import { formatCurrency } from '../../../../../core/utils/locale-format.utils';

@Component({
    selector: 'app-cart-item-row',
    imports: [CardComponent, IconComponent, TranslocoPipe],
    templateUrl: './cart-item-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartItemRowComponent {
    private readonly languageService = inject(LanguageService);
    cartItem = input.required<CartItem>();
    product = input.required<ProductDto>();
    isUpdating = input<boolean>(false);

    quantityChange = output<number>();
    remove = output<void>();

    readonly lineTotal = computed(() =>
        calculateLineTotal(
            this.cartItem().quantity,
            this.product().price,
            this.languageService.activeLanguage()
        )
    );

    readonly formattedPrice = computed(() =>
        formatCurrency(this.product().price, this.languageService.activeLanguage())
    );

    decrement(): void {
        this.quantityChange.emit(this.cartItem().quantity - 1);
    }

    increment(): void {
        this.quantityChange.emit(this.cartItem().quantity + 1);
    }

    onRemove(): void {
        this.remove.emit();
    }
}
