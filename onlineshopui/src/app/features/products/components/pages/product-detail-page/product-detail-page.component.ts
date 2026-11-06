import {
    Component,
    OnInit,
    inject,
    signal,
    computed,
    ChangeDetectionStrategy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from '../../../../../clib/components/card/card.component';
import { SpinnerComponent } from '../../../../../clib/components/spinner/spinner.component';
import { IconComponent } from '../../../../../clib/components/icon/icon.component';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../../cart/services/cart.service';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';
import { NotificationsService } from '../../../../../core/services/notifications.service';
import { take } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../../../../core/services/language.service';
import { formatCurrency } from '../../../../../core/utils/locale-format.utils';

@Component({
    selector: 'app-product-detail-page',
    standalone: true,
    imports: [CardComponent, SpinnerComponent, IconComponent, TranslocoPipe],
    templateUrl: './product-detail-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailPageComponent implements OnInit {
    private readonly productService = inject(ProductService);
    private readonly cartService = inject(CartService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly notificationsService = inject(NotificationsService);
    private readonly translocoService = inject(TranslocoService);
    private readonly languageService = inject(LanguageService);

    readonly product = this.productService.selectedProduct;
    readonly loading = this.productService.loading;
    readonly error = this.productService.error;
    readonly quantity = signal(1);

    readonly totalPrice = computed(() => {
        const prod = this.product();
        const qty = this.quantity();
        return formatCurrency(
            prod ? prod.price * qty : 0,
            this.languageService.activeLanguage()
        );
    });

    formatPrice(price: number): string {
        return formatCurrency(price, this.languageService.activeLanguage());
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.productService.loadById(id).pipe(take(1)).subscribe();
        } else {
            this.router.navigate([
                `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
            ]);
        }
    }

    getImageUrl(): string {
        return this.product()?.imageUrl || '/placeholder-product.svg';
    }

    handleImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = '/placeholder-product.svg';
    }

    incrementQuantity(): void {
        this.quantity.update(q => q + 1);
    }

    decrementQuantity(): void {
        this.quantity.update(q => Math.max(1, q - 1));
    }

    onAddToCart(): void {
        const prod = this.product();
        if (prod) {
            this.cartService.addItem(prod.id, this.quantity());
            this.notificationsService.notifySuccess({
                title: this.translocoService.translate('products.notifications.addedTitle'),
                message: this.translocoService.translate('products.notifications.addedMessage', {
                    name: prod.name
                })
            });
        }
    }

    goBack(): void {
        this.router.navigate([
            `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
        ]);
    }

    retry(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.productService.loadById(id).pipe(take(1)).subscribe();
        }
    }
}
