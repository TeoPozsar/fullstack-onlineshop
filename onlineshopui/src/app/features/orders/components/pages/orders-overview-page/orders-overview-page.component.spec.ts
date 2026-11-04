import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { OrdersOverviewPageComponent } from './orders-overview-page.component';
import { OrdersService } from '../../../services/orders.service';
import { MOCK_ORDERS } from '../../../../../core/mocks/data/orders.mock';
import { AppNavRoutes } from '../../../../../core/config/constants/navigation.constants';

describe('OrdersOverviewPageComponent', () => {
    let component: OrdersOverviewPageComponent;
    let fixture: ComponentFixture<OrdersOverviewPageComponent>;
    let ordersServiceMock: {
        orders: ReturnType<typeof signal>;
        loading: ReturnType<typeof signal>;
        error: ReturnType<typeof signal>;
        loadAll: ReturnType<typeof vi.fn>;
    };
    let routerMock: {
        navigate: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        ordersServiceMock = {
            orders: signal([...MOCK_ORDERS]),
            loading: signal(false),
            error: signal(null),
            loadAll: vi.fn().mockReturnValue(of(MOCK_ORDERS))
        };

        routerMock = {
            navigate: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [OrdersOverviewPageComponent],
            providers: [
                { provide: OrdersService, useValue: ordersServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });

        fixture = TestBed.createComponent(OrdersOverviewPageComponent);
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

        it('should load orders on init', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            component.ngOnInit();

            // Verify
            expect(ordersServiceMock.loadAll).toHaveBeenCalled();
        });

        it('should initialize with orders from service', () => {
            // Prepare
            // (component created in beforeEach)

            // Action
            fixture.detectChanges();

            // Verify
            expect(component.orders()).toEqual(MOCK_ORDERS);
        });
    });

    describe('onViewDetails()', () => {
        it('should navigate to order details page', () => {
            // Prepare
            const orderId = 'order-1';

            // Action
            component.onViewDetails(orderId);

            // Verify
            expect(routerMock.navigate).toHaveBeenCalledWith([
                '/',
                AppNavRoutes.Orders.root,
                AppNavRoutes.Orders.features.details,
                orderId
            ]);
        });
    });

    describe('retry()', () => {
        it('should reload orders', () => {
            // Prepare
            ordersServiceMock.loadAll.mockClear();

            // Action
            component.retry();

            // Verify
            expect(ordersServiceMock.loadAll).toHaveBeenCalled();
        });
    });

    describe('computed values', () => {
        it('should compute order summaries from orders', () => {
            // Prepare
            fixture.detectChanges();

            // Action
            const summaries = component.orderSummaries();

            // Verify
            expect(summaries).toHaveLength(MOCK_ORDERS.length);
        });
    });
});
