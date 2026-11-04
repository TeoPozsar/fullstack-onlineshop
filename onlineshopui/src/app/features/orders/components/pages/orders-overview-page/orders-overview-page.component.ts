import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { OrdersService } from '../../../services/orders.service';
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
    private readonly ordersService = inject(OrdersService);
    private readonly router = inject(Router);

    readonly orders = this.ordersService.orders;
    readonly loading = this.ordersService.loading;
    readonly error = this.ordersService.error;

    readonly orderSummaries = computed(() => this.orders().map(order => toOrderSummary(order)));

    ngOnInit(): void {
        this.ordersService.loadAll().pipe(take(1)).subscribe();
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
        this.ordersService.loadAll().pipe(take(1)).subscribe();
    }
}
