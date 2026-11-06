import { Component, OnInit, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { CardComponent } from '../../../../../clib/components/card/card.component';
import { SpinnerComponent } from '../../../../../clib/components/spinner/spinner.component';
import { ProductFormComponent } from '../../views/product-form/product-form.component';
import { ProductService } from '../../../services/product.service';
import { SupplierService } from '../../../services/supplier.service';
import { createProductForm } from '../../../utils/product-form.utils';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';
import { NotificationsService } from '../../../../../core/services/notifications.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-product-create-page',
    standalone: true,
    imports: [CardComponent, SpinnerComponent, ProductFormComponent, TranslocoPipe],
    templateUrl: './product-create-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCreatePageComponent implements OnInit {
    private readonly productService = inject(ProductService);
    private readonly supplierService = inject(SupplierService);
    private readonly router = inject(Router);
    private readonly notificationsService = inject(NotificationsService);
    private readonly translocoService = inject(TranslocoService);

    readonly form = createProductForm();
    readonly categories = this.productService.categories;
    readonly suppliers = this.supplierService.suppliers;
    readonly loading = this.productService.loading;
    readonly supplierLoading = this.supplierService.loading;
    readonly supplierError = this.supplierService.error;
    readonly isSubmitting = signal(false);

    constructor() {
        effect(() => {
            const disabled = this.isSubmitting();
            if (disabled) {
                this.form.disable();
            } else {
                this.form.enable();
            }
        });
    }

    ngOnInit(): void {
        this.productService.loadCategories().pipe(take(1)).subscribe();
        this.supplierService.loadAll().pipe(take(1)).subscribe();
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValue = this.form.getRawValue();
        const productData = {
            name: formValue.name,
            description: formValue.description,
            price: formValue.price,
            weight: formValue.weight,
            imageUrl: formValue.imageUrl,
            categoryId: formValue.categoryId,
            supplierId: formValue.supplierId
        };

        this.isSubmitting.set(true);
        this.productService
            .create(productData)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.notificationsService.notifySuccess({
                        title: this.translocoService.translate('products.notifications.created'),
                        message: this.translocoService.translate(
                            'products.notifications.createdMessage'
                        )
                    });
                    this.router.navigate([
                        `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
                    ]);
                },
                error: err => {
                    console.error('Failed to create product:', err);
                    this.notificationsService.notifyError({
                        title: this.translocoService.translate('products.notifications.createFailed'),
                        message: this.translocoService.translate(
                            'products.notifications.createFailedMessage'
                        )
                    });
                    this.isSubmitting.set(false);
                }
            });
    }

    onCancel(): void {
        this.router.navigate([
            `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
        ]);
    }

    retrySuppliers(): void {
        this.supplierService.loadAll().pipe(take(1)).subscribe();
    }
}
