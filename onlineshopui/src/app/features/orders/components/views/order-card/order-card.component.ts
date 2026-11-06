import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { OrderSummary } from '../../../types/order-summary.type';
import { CardComponent } from '../../../../../clib/components/card/card.component';
import { LanguageService } from '../../../../../core/services/language.service';
import { formatCurrency, formatDate } from '../../../../../core/utils/locale-format.utils';

@Component({
    selector: 'app-order-card',
    imports: [CardComponent, TranslocoPipe],
    templateUrl: './order-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCardComponent {
    private readonly languageService = inject(LanguageService);
    order = input.required<OrderSummary>();

    viewDetails = output<string>();
    readonly total = computed(() => formatCurrency(this.order().totalAmount, this.languageService.activeLanguage()));
    readonly date = computed(() => formatDate(this.order().createdAt, this.languageService.activeLanguage()));

    onViewDetails(): void {
        this.viewDetails.emit(this.order().id);
    }
}
