import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { OrderDetailPageComponent } from './order-detail-page.component';
import { OrdersService } from '../../../services/orders.service';
import { MOCK_ORDERS } from '../../../../../core/mocks/data/orders.mock';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';

describe('OrderDetailPageComponent', () => {
    let component: OrderDetailPageComponent;
    let fixture: ComponentFixture<OrderDetailPageComponent>;
    let ordersServiceMock: {
        selectedOrder: ReturnType<typeof signal>;
        loading: ReturnType<typeof signal>;
        error: ReturnType<typeof signal>;
        loadById: ReturnType<typeof vi.fn>;
    };
    let routerMock: {
        navigate: ReturnType<typeof vi.fn>;
    };
    let activatedRouteMock: {
        snapshot: {
            paramMap: ReturnType<typeof convertToParamMap>;
        };
    };

    beforeEach(() => {
        ordersServiceMock = {
            selectedOrder: signal(MOCK_ORDERS[0]),
            loading: signal(false),
            error: signal(null),
            loadById: vi.fn().mockReturnValue(of(MOCK_ORDERS[0]))
        };

        routerMock = {
            navigate: vi.fn()
        };

        activatedRouteMock = {
            snapshot: {
                paramMap: convertToParamMap({ id: 'order-1' })
            }
        };

        TestBed.configureTestingModule({
            imports: [OrderDetailPageComponent],
            providers: [
                { provide: OrdersService, useValue: ordersServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock }
            ]
        });

        fixture = TestBed.createComponent(OrderDetailPageComponent);
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

        it('should load order by id on init', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            component.ngOnInit();

            // Verify
            expect(ordersServiceMock.loadById).toHaveBeenCalledWith('order-1');
            expect(component.orderId()).toBe('order-1');
        });

        it('should navigate to orders overview when no id provided', () => {
            // Prepare
            activatedRouteMock.snapshot.paramMap = convertToParamMap({});

            // Action
            component.ngOnInit();

            // Verify
            expect(routerMock.navigate).toHaveBeenCalledWith([
                '/',
                AppNavRoutes.Orders.root,
                AppNavRoutes.Orders.features.overview
            ]);
        });
    });

    describe('goBack()', () => {
        it('should navigate to orders overview', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            component.goBack();

            // Verify
            expect(routerMock.navigate).toHaveBeenCalledWith([
                '/',
                AppNavRoutes.Orders.root,
                AppNavRoutes.Orders.features.overview
            ]);
        });
    });

    describe('retry()', () => {
        it('should reload order by id', () => {
            // Prepare
            component.ngOnInit();
            ordersServiceMock.loadById.mockClear();

            // Action
            component.retry();

            // Verify
            expect(ordersServiceMock.loadById).toHaveBeenCalledWith('order-1');
        });

        it('should not reload when no order id', () => {
            // Prepare
            activatedRouteMock.snapshot.paramMap = convertToParamMap({});
            component.ngOnInit();
            ordersServiceMock.loadById.mockClear();

            // Action
            component.retry();

            // Verify
            expect(ordersServiceMock.loadById).not.toHaveBeenCalled();
        });
    });

    describe('computed values', () => {
        it('should calculate total amount', () => {
            // Prepare
            fixture.detectChanges();

            // Action
            const totalAmount = component.totalAmount();

            // Verify
            expect(totalAmount).toBeDefined();
            expect(typeof totalAmount).toBe('string');
        });
    });
});
