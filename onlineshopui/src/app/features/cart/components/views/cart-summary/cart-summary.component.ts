import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CardComponent } from '../../../../../clib/components/card/card.component';

@Component({
    selector: 'app-cart-summary',
    imports: [CardComponent],
    templateUrl: './cart-summary.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartSummaryComponent {
    subtotal = input.required<string>();
    itemCount = input.required<number>();
    isSubmitting = input<boolean>(false);

    checkout = output<void>();
    clear = output<void>();

    onCheckout(): void {
        this.checkout.emit();
    }

    onClear(): void {
        this.clear.emit();
    }
}
