import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CreateOrderDto } from '../../../core/types/dtos/order.dto';
import { MOCK_ENVIRONMENT_CONFIG } from '../../../core/mocks/data/environment.mock';
import { MOCK_ORDERS } from '../../../core/mocks/data/orders.mock';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import { authTokenInterceptor } from '../../auth/interceptors/auth-token.interceptor';
import { AuthStore } from '../../auth/store/auth.store';
import { MOCK_JWT_TOKEN } from '../../../core/mocks/data/auth.mock';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
    let service: OrdersService;
    let httpMock: HttpTestingController;
    let authStoreMock: {
        getToken: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        authStoreMock = {
            getToken: vi.fn().mockReturnValue(MOCK_JWT_TOKEN)
        };

        TestBed.configureTestingModule({
            providers: [
                OrdersService,
                provideHttpClient(withInterceptors([authTokenInterceptor])),
                provideHttpClientTesting(),
                {
                    provide: EnvironmentConfig,
                    useValue: MOCK_ENVIRONMENT_CONFIG
                },
                { provide: AuthStore, useValue: authStoreMock }
            ]
        });

        service = TestBed.inject(OrdersService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should expose the order list API boundary', () => {
        let response: unknown;

        service.loadAll().subscribe(value => (response = value));

        const request = httpMock.expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/orders`);
        expect(request.request.method).toBe('GET');
        request.flush(MOCK_ORDERS);

        expect(response).toEqual(MOCK_ORDERS);
    });

    it('should preserve authenticated order requests through the interceptor boundary', () => {
        service.loadAll().subscribe();

        const request = httpMock.expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/orders`);
        expect(request.request.headers.has('Authorization')).toBe(true);
        expect(authStoreMock.getToken).toHaveBeenCalledOnce();
        request.flush(MOCK_ORDERS);
    });

    it('should expose the order detail API boundary', () => {
        let response: unknown;

        service.loadById('order-1').subscribe(value => (response = value));

        const request = httpMock.expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/orders/order-1`);
        expect(request.request.method).toBe('GET');
        request.flush(MOCK_ORDERS[0]);

        expect(response).toEqual(MOCK_ORDERS[0]);
    });

    it('should preserve the create order request payload and response', () => {
        const order: CreateOrderDto = {
            items: [{ productId: 'prod-1', quantity: 2 }],
            address: {
                country: 'USA',
                city: 'Seattle',
                county: 'King',
                streetAddress: '123 Pine Street'
            }
        };
        let response: unknown;

        service.create(order).subscribe(value => (response = value));

        const request = httpMock.expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/orders`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(order);
        request.flush(MOCK_ORDERS[0]);

        expect(response).toEqual(MOCK_ORDERS[0]);
    });
});
