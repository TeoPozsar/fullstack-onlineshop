import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { OrdersService } from '../../../services/orders.service';
import { SpinnerComponent } from '../../../../../clib/components/spinner/spinner.component';
import { CardComponent } from '../../../../../clib/components/card/card.component';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';
import { calculateOrderTotal } from '../../../utils/order.utils';
import { IconComponent } from '../../../../../clib/components/icon/icon.component';
import { LanguageService } from '../../../../../core/services/language.service';
import { formatCurrency, formatDate } from '../../../../../core/utils/locale-format.utils';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-order-detail-page',
    imports: [SpinnerComponent, CardComponent, IconComponent, TranslocoPipe],
    templateUrl: './order-detail-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailPageComponent implements OnInit {
    private readonly ordersService = inject(OrdersService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly languageService = inject(LanguageService);

    readonly order = this.ordersService.selectedOrder;
    readonly loading = this.ordersService.loading;
    readonly error = this.ordersService.error;
    readonly orderId = signal<string | null>(null);

    readonly totalAmount = computed(() =>
        calculateOrderTotal(this.order(), this.languageService.activeLanguage())
    );
    readonly createdDate = computed(() =>
        this.order() ? formatDate(this.order()!.createdAt, this.languageService.activeLanguage()) : ''
    );

    lineTotal(quantity: number, price: number): string {
        return formatCurrency(quantity * price, this.languageService.activeLanguage());
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.orderId.set(id);
            this.ordersService.loadById(id).pipe(take(1)).subscribe();
        } else {
            this.router.navigate([
                '/',
                AppNavRoutes.Orders.root,
                AppNavRoutes.Orders.features.overview
            ]);
        }
    }

    goBack(): void {
        this.router.navigate([
            '/',
            AppNavRoutes.Orders.root,
            AppNavRoutes.Orders.features.overview
        ]);
    }

    retry(): void {
        const id = this.orderId();
        if (!id) return;
        this.ordersService.loadById(id).pipe(take(1)).subscribe();
    }
}
