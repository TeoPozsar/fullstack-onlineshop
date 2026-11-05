import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { ProductCreatePageComponent } from './product-create-page.component';
import { ProductService } from '../../../services/product.service';
import { NotificationsService } from '../../../../../core/services/notifications.service';
import {
    MOCK_CATEGORIES,
    MOCK_PRODUCTS,
    MOCK_SUPPLIERS
} from '../../../../../core/mocks/data/products.mock';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';
import { ValidationMessages } from '../../../../../core/types/providers/validation-messages';
import { DefaultValidationMessages } from '../../../../../core/config/constants/validation.constants';

describe('ProductCreatePageComponent', () => {
    let component: ProductCreatePageComponent;
    let fixture: ComponentFixture<ProductCreatePageComponent>;
    let productServiceMock: {
        categories: ReturnType<typeof signal>;
        suppliers: ReturnType<typeof signal>;
        loading: ReturnType<typeof signal>;
        supplierLoading: ReturnType<typeof signal>;
        supplierError: ReturnType<typeof signal>;
        loadCategories: ReturnType<typeof vi.fn>;
        loadSuppliers: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
    };
    let routerMock: {
        navigate: ReturnType<typeof vi.fn>;
    };
    let notificationsServiceMock: {
        notifySuccess: ReturnType<typeof vi.fn>;
        notifyError: ReturnType<typeof vi.fn>;
    };
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Mock console.error to suppress expected error logs during error handling tests
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        productServiceMock = {
            categories: signal([...MOCK_CATEGORIES]),
            suppliers: signal([...MOCK_SUPPLIERS]),
            loading: signal(false),
            supplierLoading: signal(false),
            supplierError: signal(null),
            loadCategories: vi.fn().mockReturnValue(of(MOCK_CATEGORIES)),
            loadSuppliers: vi.fn().mockReturnValue(of(MOCK_SUPPLIERS)),
            create: vi.fn().mockReturnValue(of(MOCK_PRODUCTS[0]))
        };

        routerMock = {
            navigate: vi.fn()
        };

        notificationsServiceMock = {
            notifySuccess: vi.fn(),
            notifyError: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [ProductCreatePageComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: NotificationsService, useValue: notificationsServiceMock },
                { provide: ValidationMessages, useValue: DefaultValidationMessages }
            ]
        });

        fixture = TestBed.createComponent(ProductCreatePageComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('Initialization', () => {
        it('should create', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            // (no action needed)

            // Verify
            expect(component).toBeTruthy();
        });

        it('should load categories on init', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            component.ngOnInit();

            // Verify
            expect(productServiceMock.loadCategories).toHaveBeenCalled();
            expect(productServiceMock.loadSuppliers).toHaveBeenCalled();
        });

        it('should initialize with empty form', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            fixture.detectChanges();

            // Verify
            expect(component.form.value).toEqual({
                name: '',
                description: '',
                price: 0,
                weight: 0,
                imageUrl: '',
                categoryId: '',
                supplierId: ''
            });
        });
    });

    describe('supplier loading', () => {
        it('should display supplier errors and allow retrying', () => {
            productServiceMock.supplierError.set('Failed to load suppliers');
            fixture.detectChanges();

            expect(fixture.nativeElement.textContent).toContain('Failed to load suppliers');

            productServiceMock.loadSuppliers.mockClear();
            component.retrySuppliers();

            expect(productServiceMock.loadSuppliers).toHaveBeenCalledOnce();
        });
    });

    describe('onSubmit()', () => {
        it('should not submit when form is invalid', () => {
            // Prepare
            fixture.detectChanges();
            expect(component.form.invalid).toBe(true);

            // Action
            component.onSubmit();

            // Verify
            expect(productServiceMock.create).not.toHaveBeenCalled();
            expect(component.form.touched).toBe(true);
        });

        it('should create product and navigate on success', () => {
            // Prepare
            fixture.detectChanges();
            component.form.patchValue({
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                weight: 1.5,
                imageUrl: 'http://test.com/image.jpg',
                categoryId: 'cat-1',
                supplierId: MOCK_SUPPLIERS[0].id
            });

            // Action
            component.onSubmit();

            // Verify
            expect(productServiceMock.create).toHaveBeenCalled();
            expect(productServiceMock.create).toHaveBeenCalledWith(
                expect.objectContaining({ supplierId: MOCK_SUPPLIERS[0].id })
            );
            expect(notificationsServiceMock.notifySuccess).toHaveBeenCalledWith({
                title: 'Product created',
                message: 'Your new product is now available.'
            });
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
            ]);
        });

        it('should handle create failure', () => {
            // Prepare
            fixture.detectChanges();
            component.form.patchValue({
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                weight: 1.5,
                imageUrl: 'http://test.com/image.jpg',
                categoryId: 'cat-1',
                supplierId: MOCK_SUPPLIERS[0].id
            });
            productServiceMock.create.mockReturnValue(throwError(() => new Error('Failed')));

            // Action
            component.onSubmit();

            // Verify
            expect(notificationsServiceMock.notifyError).toHaveBeenCalledWith({
                title: 'Create failed',
                message: 'Unable to create the product.'
            });
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should disable form while submitting', () => {
            // Prepare
            fixture.detectChanges();
            component.form.patchValue({
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                weight: 1.5,
                imageUrl: 'http://test.com/image.jpg',
                categoryId: 'cat-1',
                supplierId: MOCK_SUPPLIERS[0].id
            });
            expect(component.form.enabled).toBe(true);

            // Action
            component.isSubmitting.set(true);
            fixture.detectChanges();

            // Verify
            expect(component.form.disabled).toBe(true);
        });
    });

    describe('onCancel()', () => {
        it('should navigate to products overview', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            component.onCancel();

            // Verify
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
            ]);
        });
    });
});
