import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OrderSummary } from '../../../types/order-summary.type';
import { CardComponent } from '../../../../../clib/components/card/card.component';

@Component({
    selector: 'app-order-card',
    imports: [CardComponent],
    templateUrl: './order-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCardComponent {
    order = input.required<OrderSummary>();

    viewDetails = output<string>();

    onViewDetails(): void {
        this.viewDetails.emit(this.order().id);
    }
}
