import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { OrderStore } from '../../../store/order.store';
import { toOrderSummary } from '../../../utils/order.utils';
import { SpinnerComponent } from '../../../../../clib/components/spinner/spinner.component';
import { OrderCardComponent } from '../../views/order-card/order-card.component';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';

@Component({
    selector: 'app-orders-overview-page',
    imports: [SpinnerComponent, OrderCardComponent],
    templateUrl: './orders-overview-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersOverviewPageComponent implements OnInit {
    private readonly orderStore = inject(OrderStore);
    private readonly router = inject(Router);

    readonly orders = this.orderStore.orders;
    readonly loading = this.orderStore.listLoading;
    readonly error = this.orderStore.listError;

    readonly orderSummaries = computed(() => this.orders().map(order => toOrderSummary(order)));

    ngOnInit(): void {
        this.orderStore.loadAll().pipe(take(1)).subscribe();
    }

    onViewDetails(orderId: string): void {
        this.router.navigate([
            '/',
            AppNavRoutes.Orders.root,
            AppNavRoutes.Orders.features.details,
            orderId
        ]);
    }

    retry(): void {
        this.orderStore.loadAll().pipe(take(1)).subscribe();
    }
}
