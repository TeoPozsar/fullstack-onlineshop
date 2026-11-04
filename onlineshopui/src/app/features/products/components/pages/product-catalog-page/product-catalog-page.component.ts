import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    OnInit,
    signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductCardComponent } from '../../views/product-card/product-card.component';
import { SpinnerComponent } from '../../../../../clib/components/spinner/spinner.component';
import { ModalComponent } from '../../../../../clib/components/modal/modal.component';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../../cart/services/cart.service';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';
import { NotificationsService } from '../../../../../core/services/notifications.service';
import { HasRoleDirective } from '../../../../auth/directives/has-role.directive';
import { UserRole } from '../../../../../core/types/enums/user-roles.enum';
import { take } from 'rxjs';

@Component({
    selector: 'app-product-catalog-page',
    standalone: true,
    imports: [ProductCardComponent, SpinnerComponent, ModalComponent, RouterLink, HasRoleDirective],
    templateUrl: './product-catalog-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCatalogPageComponent implements OnInit {
    private readonly productService = inject(ProductService);
    private readonly cartService = inject(CartService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly notificationsService = inject(NotificationsService);

    readonly products = this.productService.products;
    readonly loading = this.productService.loading;
    readonly error = this.productService.error;

    readonly showDeleteModal = signal(false);
    readonly productToDelete = signal<string | null>(null);
    readonly isDeleting = signal(false);
    readonly UserRole = UserRole;

    ngOnInit(): void {
        this.loadProducts();
    }

    onViewDetails(productId: string): void {
        this.router.navigate([`/${AppNavRoutes.Products.root}`, productId]);
    }

    onAddToCart(productId: string): void {
        this.cartService.addItem(productId, 1);
        const product = this.products().find(item => item.id === productId);
        const name = product?.name ?? 'Product';
        this.notificationsService.notifySuccess({
            title: 'Added to cart',
            message: `${name} was added to your cart.`
        });
    }

    onEdit(productId: string): void {
        this.router.navigate([
            `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.update}`,
            productId
        ]);
    }

    onDelete(productId: string): void {
        this.productToDelete.set(productId);
        this.showDeleteModal.set(true);
    }

    confirmDelete(): void {
        const productId = this.productToDelete();
        if (!productId) return;

        this.isDeleting.set(true);
        this.productService
            .delete(productId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.isDeleting.set(false);
                    this.showDeleteModal.set(false);
                    this.productToDelete.set(null);
                    this.loadProducts();
                },
                error: (err: HttpErrorResponse) => {
                        this.isDeleting.set(false);
                        this.showDeleteModal.set(false);
                        this.productToDelete.set(null);
                        this.notificationsService.notifyError({
                            title: 'Delete failed',
                            message: err.error?.error || 'An unexpected error occurred while deleting the product.'
                        });
                    }
            });
    }

    cancelDelete(): void {
        this.showDeleteModal.set(false);
        this.productToDelete.set(null);
    }

    retry(): void {
        this.loadProducts();
    }

    private loadProducts(): void {
        this.productService.loadAll().pipe(take(1)).subscribe();
    }
}
