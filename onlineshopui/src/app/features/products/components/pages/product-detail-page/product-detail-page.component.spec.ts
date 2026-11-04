import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { ProductDetailPageComponent } from './product-detail-page.component';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../../cart/services/cart.service';
import { NotificationsService } from '../../../../../core/services/notifications.service';
import { MOCK_PRODUCTS } from '../../../../../core/mocks/data/products.mock';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';

describe('ProductDetailPageComponent', () => {
    let component: ProductDetailPageComponent;
    let fixture: ComponentFixture<ProductDetailPageComponent>;
    let productServiceMock: {
        selectedProduct: ReturnType<typeof signal>;
        loading: ReturnType<typeof signal>;
        error: ReturnType<typeof signal>;
        loadById: ReturnType<typeof vi.fn>;
    };
    let cartServiceMock: {
        addItem: ReturnType<typeof vi.fn>;
    };
    let routerMock: {
        navigate: ReturnType<typeof vi.fn>;
    };
    let activatedRouteMock: {
        snapshot: {
            paramMap: ReturnType<typeof convertToParamMap>;
        };
    };
    let notificationsServiceMock: {
        notifySuccess: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        productServiceMock = {
            selectedProduct: signal(MOCK_PRODUCTS[0]),
            loading: signal(false),
            error: signal(null),
            loadById: vi.fn().mockReturnValue(of(MOCK_PRODUCTS[0]))
        };

        cartServiceMock = {
            addItem: vi.fn()
        };

        routerMock = {
            navigate: vi.fn()
        };

        activatedRouteMock = {
            snapshot: {
                paramMap: convertToParamMap({ id: 'prod-1' })
            }
        };

        notificationsServiceMock = {
            notifySuccess: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [ProductDetailPageComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: CartService, useValue: cartServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock },
                { provide: NotificationsService, useValue: notificationsServiceMock }
            ]
        });

        fixture = TestBed.createComponent(ProductDetailPageComponent);
        component = fixture.componentInstance;
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

        it('should load product by id on init', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            component.ngOnInit();

            // Verify
            expect(productServiceMock.loadById).toHaveBeenCalledWith('prod-1');
        });

        it('should navigate to products overview when no id provided', () => {
            // Prepare
            activatedRouteMock.snapshot.paramMap = convertToParamMap({});

            // Action
            component.ngOnInit();

            // Verify
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
            ]);
        });
    });

    describe('getImageUrl()', () => {
        it('should return product image url', () => {
            // Prepare
            fixture.detectChanges();

            // Action
            const imageUrl = component.getImageUrl();

            // Verify
            expect(imageUrl).toBe(MOCK_PRODUCTS[0].imageUrl);
        });

        it('should return placeholder when no product', () => {
            // Prepare
            productServiceMock.selectedProduct.set(null);
            fixture.detectChanges();

            // Action
            const imageUrl = component.getImageUrl();

            // Verify
            expect(imageUrl).toBe('/placeholder-product.svg');
        });
    });

    describe('handleImageError()', () => {
        it('should set placeholder image on error', () => {
            // Prepare
            const mockImg = { src: 'original.jpg' } as HTMLImageElement;
            const event = { target: mockImg } as unknown as Event;

            // Action
            component.handleImageError(event);

            // Verify
            expect(mockImg.src).toBe('/placeholder-product.svg');
        });
    });

    describe('quantity management', () => {
        it('should increment quantity', () => {
            // Prepare
            component.quantity.set(1);

            // Action
            component.incrementQuantity();

            // Verify
            expect(component.quantity()).toBe(2);
        });

        it('should decrement quantity', () => {
            // Prepare
            component.quantity.set(3);

            // Action
            component.decrementQuantity();

            // Verify
            expect(component.quantity()).toBe(2);
        });

        it('should not decrement below 1', () => {
            // Prepare
            component.quantity.set(1);

            // Action
            component.decrementQuantity();

            // Verify
            expect(component.quantity()).toBe(1);
        });
    });

    describe('onAddToCart()', () => {
        it('should add product to cart with selected quantity', () => {
            // Prepare
            fixture.detectChanges();
            component.quantity.set(3);

            // Action
            component.onAddToCart();

            // Verify
            expect(cartServiceMock.addItem).toHaveBeenCalledWith(MOCK_PRODUCTS[0].id, 3);
            expect(notificationsServiceMock.notifySuccess).toHaveBeenCalledWith({
                title: 'Added to cart',
                message: `${MOCK_PRODUCTS[0].name} was added to your cart.`
            });
        });

        it('should not add when no product selected', () => {
            // Prepare
            productServiceMock.selectedProduct.set(null);

            // Action
            component.onAddToCart();

            // Verify
            expect(cartServiceMock.addItem).not.toHaveBeenCalled();
        });
    });

    describe('goBack()', () => {
        it('should navigate to products overview', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            component.goBack();

            // Verify
            expect(routerMock.navigate).toHaveBeenCalledWith([
                `/${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
            ]);
        });
    });

    describe('retry()', () => {
        it('should reload product by id', () => {
            // Prepare
            component.ngOnInit();
            productServiceMock.loadById.mockClear();

            // Action
            component.retry();

            // Verify
            expect(productServiceMock.loadById).toHaveBeenCalledWith('prod-1');
        });

        it('should not reload when no product id', () => {
            // Prepare
            activatedRouteMock.snapshot.paramMap = convertToParamMap({});
            component.ngOnInit();
            productServiceMock.loadById.mockClear();

            // Action
            component.retry();

            // Verify
            expect(productServiceMock.loadById).not.toHaveBeenCalled();
        });
    });

    describe('computed values', () => {
        it('should calculate total price', () => {
            // Prepare
            fixture.detectChanges();
            component.quantity.set(2);

            // Action
            const totalPrice = component.totalPrice();

            // Verify
            const expected = (MOCK_PRODUCTS[0].price * 2).toFixed(2);
            expect(totalPrice).toBe(expected);
        });

        it('should return 0.00 when no product', () => {
            // Prepare
            productServiceMock.selectedProduct.set(null);
            fixture.detectChanges();

            // Action
            const totalPrice = component.totalPrice();

            // Verify
            expect(totalPrice).toBe('0.00');
        });
    });
});
