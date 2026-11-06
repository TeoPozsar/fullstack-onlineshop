import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    signal
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { ProductService } from '../../../../products/services/product.service';
import { OrdersService } from '../../../../orders/services/orders.service';
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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../../../../core/services/language.service';

@Component({
    selector: 'app-cart-overview-page',
    imports: [
        SpinnerComponent,
        ErrorMessageComponent,
        CartItemRowComponent,
        CartSummaryComponent,
        ReactiveFormsModule,
        RouterLink,
        TranslocoPipe
    ],
    templateUrl: './cart-overview-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartOverviewPageComponent implements OnInit {
    private readonly cartService = inject(CartService);
    private readonly productService = inject(ProductService);
    private readonly ordersService = inject(OrdersService);
    private readonly router = inject(Router);
    private readonly notificationsService = inject(NotificationsService);
    private readonly translocoService = inject(TranslocoService);
    private readonly languageService = inject(LanguageService);

    readonly cartItems = this.cartService.items;
    readonly products = this.productService.products;
    readonly loading = this.productService.loading;
    readonly error = this.productService.error;
    readonly isSubmitting = signal(false);
    readonly addressForm = createAddressForm();
    readonly productsLink = [
        '/',
        AppNavRoutes.Products.root,
        AppNavRoutes.Products.features.overview
    ];

    readonly productsById = computed(() => buildProductsById(this.products()));

    readonly subtotal = computed(() =>
        calculateCartSubtotal(
            this.cartItems(),
            this.productsById(),
            this.languageService.activeLanguage()
        )
    );

    readonly itemCount = this.cartService.totalItems;

    ngOnInit(): void {
        this.productService.loadAll().pipe(take(1)).subscribe();
    }

    onQuantityChange(productId: string, quantity: number): void {
        this.cartService.updateQuantity(productId, quantity);
    }

    onRemoveItem(productId: string): void {
        this.cartService.removeItem(productId);
    }

    onClearCart(): void {
        this.cartService.clear();
    }

    onCheckout(): void {
        if (this.cartItems().length === 0 || this.isSubmitting()) return;

        if (this.addressForm.invalid) {
            this.addressForm.markAllAsTouched();
            return;
        }

        const payload = toCreateOrderDto(this.cartItems(), this.addressForm.getRawValue());
        if (!payload) return;

        this.isSubmitting.set(true);
        this.ordersService
            .create(payload)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.cartService.clear();
                    this.notificationsService.notifySuccess({
                        title: this.translocoService.translate('cart.notifications.orderPlaced'),
                        message: this.translocoService.translate(
                            'cart.notifications.orderPlacedMessage'
                        )
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
                        title: this.translocoService.translate('cart.notifications.orderFailed'),
                        message: this.translocoService.translate(
                            'cart.notifications.orderFailedMessage'
                        )
                    });
                    this.isSubmitting.set(false);
                }
            });
    }

    retry(): void {
        this.productService.loadAll().pipe(take(1)).subscribe();
    }
}
