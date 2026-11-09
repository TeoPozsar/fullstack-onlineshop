import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { OrderStore } from './order.store';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../../../core/types/dtos/order.dto';
import { MOCK_ORDERS } from '../../../core/mocks/data/orders.mock';

describe('OrderStore', () => {
    let store: InstanceType<typeof OrderStore>;
    let ordersServiceMock: {
        loadAll: ReturnType<typeof vi.fn>;
        loadById: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        ordersServiceMock = {
            loadAll: vi.fn(),
            loadById: vi.fn(),
            create: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [OrderStore, { provide: OrdersService, useValue: ordersServiceMock }]
        });

        store = TestBed.inject(OrderStore);
    });

    it('should initialize explicit order state and computed values', () => {
        expect(store.orders()).toEqual([]);
        expect(store.selectedOrder()).toBeNull();
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        expect(store.listLoading()).toBe(false);
        expect(store.detailLoading()).toBe(false);
        expect(store.creationLoading()).toBe(false);
        expect(store.orderCount()).toBe(0);
        expect(store.hasSelectedOrder()).toBe(false);
    });

    it('should retrieve orders and track list status independently', () => {
        const response = new Subject<typeof MOCK_ORDERS>();
        ordersServiceMock.loadAll.mockReturnValue(response);

        store.loadAll().subscribe();

        expect(store.listLoading()).toBe(true);
        expect(store.loading()).toBe(true);

        response.next(MOCK_ORDERS);
        response.complete();

        expect(store.orders()).toEqual(MOCK_ORDERS);
        expect(store.listLoading()).toBe(false);
        expect(store.listError()).toBeNull();
        expect(store.loading()).toBe(false);
        expect(store.orderCount()).toBe(MOCK_ORDERS.length);
    });

    it('should record list errors and return a success-shaped fallback', () => {
        ordersServiceMock.loadAll.mockReturnValue(throwError(() => new Error('Failed')));
        let completed = false;

        store.loadAll().subscribe({ complete: () => (completed = true) });

        expect(completed).toBe(true);
        expect(store.orders()).toEqual([]);
        expect(store.listError()).toBe('Failed to load orders');
        expect(store.listLoading()).toBe(false);
        expect(store.error()).toBe('Failed to load orders');
    });

    it('should retrieve order details and clear the selected order on failure', () => {
        ordersServiceMock.loadById
            .mockReturnValueOnce(of(MOCK_ORDERS[0]))
            .mockReturnValueOnce(throwError(() => new Error('Not found')));

        store.loadById('order-1').subscribe();

        expect(store.selectedOrder()).toEqual(MOCK_ORDERS[0]);
        expect(store.hasSelectedOrder()).toBe(true);
        expect(store.detailLoading()).toBe(false);

        store.loadById('missing').subscribe();

        expect(store.selectedOrder()).toBeNull();
        expect(store.detailError()).toBe('Failed to load order');
        expect(store.detailLoading()).toBe(false);
        expect(store.error()).toBe('Failed to load order');
    });

    it('should track list and detail loading independently', () => {
        const listResponse = new Subject<typeof MOCK_ORDERS>();
        const detailResponse = new Subject<(typeof MOCK_ORDERS)[number]>();
        ordersServiceMock.loadAll.mockReturnValue(listResponse);
        ordersServiceMock.loadById.mockReturnValue(detailResponse);

        store.loadAll().subscribe();
        store.loadById('order-1').subscribe();

        expect(store.listLoading()).toBe(true);
        expect(store.detailLoading()).toBe(true);
        expect(store.loading()).toBe(true);

        listResponse.next(MOCK_ORDERS);
        listResponse.complete();

        expect(store.listLoading()).toBe(false);
        expect(store.detailLoading()).toBe(true);
        expect(store.loading()).toBe(true);

        detailResponse.next(MOCK_ORDERS[0]);
        detailResponse.complete();

        expect(store.detailLoading()).toBe(false);
        expect(store.loading()).toBe(false);
    });

    it('should create an order and prepend it to shared order state', () => {
        const existingOrder = MOCK_ORDERS[0];
        const createdOrder = { ...existingOrder, id: 'order-new' };
        const order: CreateOrderDto = {
            items: [{ productId: 'prod-1', quantity: 1 }],
            address: existingOrder.address!
        };
        ordersServiceMock.loadAll.mockReturnValue(of([existingOrder]));
        ordersServiceMock.create.mockReturnValue(of(createdOrder));

        store.loadAll().subscribe();
        let result: unknown;
        store.create(order).subscribe(created => (result = created));

        expect(result).toEqual(createdOrder);
        expect(store.orders()).toEqual([createdOrder, existingOrder]);
        expect(store.creationLoading()).toBe(false);
        expect(store.creationError()).toBeNull();
    });

    it('should propagate creation errors and track final creation status', () => {
        const error = new Error('Rejected');
        ordersServiceMock.create.mockReturnValue(throwError(() => error));
        let receivedError: unknown;

        store.create({ items: [], address: MOCK_ORDERS[0].address! }).subscribe({
            error: received => (receivedError = received)
        });

        expect(receivedError).toBe(error);
        expect(store.creationError()).toBe('Failed to create order');
        expect(store.creationLoading()).toBe(false);
        expect(store.loading()).toBe(false);
    });

    it('should clear the selected order explicitly', () => {
        ordersServiceMock.loadById.mockReturnValue(of(MOCK_ORDERS[0]));
        store.loadById(MOCK_ORDERS[0].id).subscribe();

        store.clearSelectedOrder();

        expect(store.selectedOrder()).toBeNull();
        expect(store.hasSelectedOrder()).toBe(false);
    });
});
