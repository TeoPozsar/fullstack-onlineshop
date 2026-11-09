import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { CartStore } from '../../../store/cart.store';
import { ProductStore } from '../../../../products/store/product.store';
import { OrderStore } from '../../../../orders/store/order.store';
import { SpinnerComponent } from '../../../../../clib/components/spinner/spinner.component';
import { ErrorMessageComponent } from '../../../../../clib/components/error-message/error-message.component';
import { CartItemRowComponent } from '../../views/cart-item-row/cart-item-row.component';
import { CartSummaryComponent } from '../../views/cart-summary/cart-summary.component';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';
import { NotificationsService } from '../../../../../core/services/notifications.service';
import {
    buildProductsById,
    calculateCartSubtotal,
    toCreateOrderDto
} from '../../../utils/cart.utils';
import { createAddressForm } from '../../../utils/address-form.utils';

@Component({
    selector: 'app-cart-overview-page',
    imports: [
        SpinnerComponent,
        ErrorMessageComponent,
        CartItemRowComponent,
        CartSummaryComponent,
        ReactiveFormsModule,
        RouterLink
    ],
    templateUrl: './cart-overview-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartOverviewPageComponent implements OnInit {
    private readonly cartStore = inject(CartStore);
    private readonly productStore = inject(ProductStore);
    private readonly orderStore = inject(OrderStore);
    private readonly router = inject(Router);
    private readonly notificationsService = inject(NotificationsService);

    readonly cartItems = this.cartStore.items;
    readonly cartLoading = this.cartStore.loading;
    readonly cartError = this.cartStore.error;
    readonly products = this.productStore.products;
    readonly loading = this.productStore.loading;
    readonly error = this.productStore.error;
    readonly isSubmitting = this.orderStore.creationLoading;
    readonly addressForm = createAddressForm();
    readonly productsLink = [
        '/',
        AppNavRoutes.Products.root,
        AppNavRoutes.Products.features.overview
    ];

    readonly productsById = computed(() => buildProductsById(this.products()));

    readonly subtotal = computed(() =>
        calculateCartSubtotal(this.cartItems(), this.productsById())
    );

    readonly itemCount = this.cartStore.totalItems;

    ngOnInit(): void {
        this.productStore.loadAll().pipe(take(1)).subscribe();
    }

    onQuantityChange(productId: string, quantity: number): void {
        this.cartStore.updateQuantity(productId, quantity);
    }

    onRemoveItem(productId: string): void {
        this.cartStore.removeItem(productId);
    }

    onClearCart(): void {
        this.cartStore.clear();
    }

    onCheckout(): void {
        if (this.cartItems().length === 0 || this.isSubmitting()) return;

        if (this.addressForm.invalid) {
            this.addressForm.markAllAsTouched();
            return;
        }

        const payload = toCreateOrderDto(this.cartItems(), this.addressForm.getRawValue());
        if (!payload) return;

        this.orderStore
            .create(payload)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.cartStore.clear();
                    this.notificationsService.notifySuccess({
                        title: 'Order placed',
                        message: 'Your order is being processed.'
                    });
                    this.router.navigate([
                        '/',
                        AppNavRoutes.Orders.root,
                        AppNavRoutes.Orders.features.overview
                    ]);
                },
                error: err => {
                    console.error('Failed to create order:', err);
                    this.notificationsService.notifyError({
                        title: 'Order failed',
                        message: 'Please try again in a moment.'
                    });
                }
            });
    }

    retry(): void {
        this.productStore.loadAll().pipe(take(1)).subscribe();
    }

    retryCart(): void {
        this.cartStore.restore();
    }
}
