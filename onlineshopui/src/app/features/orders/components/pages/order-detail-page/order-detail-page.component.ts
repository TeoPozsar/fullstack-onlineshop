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
import { OrderStore } from '../../../store/order.store';
import { SpinnerComponent } from '../../../../../clib/components/spinner/spinner.component';
import { CardComponent } from '../../../../../clib/components/card/card.component';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';
import { calculateOrderTotal } from '../../../utils/order.utils';
import { IconComponent } from '../../../../../clib/components/icon/icon.component';

@Component({
    selector: 'app-order-detail-page',
    imports: [SpinnerComponent, CardComponent, IconComponent],
    templateUrl: './order-detail-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailPageComponent implements OnInit {
    private readonly orderStore = inject(OrderStore);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly order = this.orderStore.selectedOrder;
    readonly loading = this.orderStore.detailLoading;
    readonly error = this.orderStore.detailError;
    readonly orderId = signal<string | null>(null);

    readonly totalAmount = computed(() => calculateOrderTotal(this.order()));

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.orderId.set(id);
            this.orderStore.loadById(id).pipe(take(1)).subscribe();
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
        this.orderStore.loadById(id).pipe(take(1)).subscribe();
    }
}
