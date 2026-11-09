import { Component, OnInit, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { CardComponent } from '../../../../../clib/components/card/card.component';
import { SpinnerComponent } from '../../../../../clib/components/spinner/spinner.component';
import { ProductFormComponent } from '../../views/product-form/product-form.component';
import { ProductStore } from '../../../store/product.store';
import { SupplierService } from '../../../services/supplier.service';
import { createProductForm } from '../../../utils/product-form.utils';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';
import { NotificationsService } from '../../../../../core/services/notifications.service';

@Component({
    selector: 'app-product-create-page',
    standalone: true,
    imports: [CardComponent, SpinnerComponent, ProductFormComponent],
    templateUrl: './product-create-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCreatePageComponent implements OnInit {
    private readonly productStore = inject(ProductStore);
    private readonly supplierService = inject(SupplierService);
    private readonly router = inject(Router);
    private readonly notificationsService = inject(NotificationsService);

    readonly form = createProductForm();
    readonly categories = this.productStore.categories;
    readonly suppliers = this.supplierService.suppliers;
    readonly categoryLoading = this.productStore.categoryLoading;
    readonly categoryError = this.productStore.categoryError;
    readonly supplierLoading = this.supplierService.loading;
    readonly supplierError = this.supplierService.error;
    readonly isSubmitting = this.productStore.mutationLoading;
    readonly mutationError = this.productStore.mutationError;

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
        this.productStore.loadCategories().pipe(take(1)).subscribe();
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

        this.productStore
            .create(productData)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.notificationsService.notifySuccess({
                        title: 'Product created',
                        message: 'Your new product is now available.'
                    });
                    this.router.navigate([
                        `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
                    ]);
                },
                error: err => {
                    console.error('Failed to create product:', err);
                    this.notificationsService.notifyError({
                        title: 'Create failed',
                        message: 'Unable to create the product.'
                    });
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

    retryCategories(): void {
        this.productStore.loadCategories().pipe(take(1)).subscribe();
    }
}
