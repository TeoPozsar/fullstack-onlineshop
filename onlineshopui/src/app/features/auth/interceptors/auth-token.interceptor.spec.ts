import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { authTokenInterceptor } from './auth-token.interceptor';
import { AuthStore } from '../store/auth.store';
import { MOCK_JWT_TOKEN } from '../../../core/mocks/data/auth.mock';

describe('authTokenInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let authStoreMock: {
        getToken: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        authStoreMock = {
            getToken: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authTokenInterceptor])),
                provideHttpClientTesting(),
                {
                    provide: AuthStore,
                    useValue: authStoreMock
                }
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should add Authorization header when token exists', () => {
        // Prepare
        authStoreMock.getToken.mockReturnValue(MOCK_JWT_TOKEN);

        // Action
        httpClient.get('/api/test').subscribe();

        // Verify
        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(true);
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
        req.flush({});
    });

    it('should not add Authorization header when token is null', () => {
        // Prepare
        authStoreMock.getToken.mockReturnValue(null);

        // Action
        httpClient.get('/api/test').subscribe();

        // Verify
        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('should not add Authorization header when token is undefined', () => {
        // Prepare
        authStoreMock.getToken.mockReturnValue(undefined);

        // Action
        httpClient.get('/api/test').subscribe();

        // Verify
        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('should not add Authorization header when token is empty string', () => {
        // Prepare
        authStoreMock.getToken.mockReturnValue('');

        // Action
        httpClient.get('/api/test').subscribe();

        // Verify
        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('should preserve existing headers when adding Authorization', () => {
        // Prepare
        authStoreMock.getToken.mockReturnValue(MOCK_JWT_TOKEN);

        // Action
        httpClient
            .get('/api/test', {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Custom-Header': 'custom-value'
                }
            })
            .subscribe();

        // Verify
        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
        req.flush({});
    });

    it('should work with POST requests', () => {
        // Prepare
        authStoreMock.getToken.mockReturnValue(MOCK_JWT_TOKEN);

        // Action
        httpClient.post('/api/test', { data: 'test' }).subscribe();

        // Verify
        const req = httpMock.expectOne('/api/test');
        expect(req.request.method).toBe('POST');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
        expect(req.request.body).toEqual({ data: 'test' });
        req.flush({});
    });

    it('should work with PUT requests', () => {
        // Prepare
        authStoreMock.getToken.mockReturnValue(MOCK_JWT_TOKEN);

        // Action
        httpClient.put('/api/test/1', { data: 'updated' }).subscribe();

        // Verify
        const req = httpMock.expectOne('/api/test/1');
        expect(req.request.method).toBe('PUT');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
        req.flush({});
    });

    it('should work with DELETE requests', () => {
        // Prepare
        authStoreMock.getToken.mockReturnValue(MOCK_JWT_TOKEN);

        // Action
        httpClient.delete('/api/test/1').subscribe();

        // Verify
        const req = httpMock.expectOne('/api/test/1');
        expect(req.request.method).toBe('DELETE');
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_JWT_TOKEN}`);
        req.flush({});
    });

    it('should call getToken for each request', () => {
        // Prepare
        authStoreMock.getToken.mockReturnValue(MOCK_JWT_TOKEN);

        // Action
        httpClient.get('/api/test1').subscribe();
        httpClient.get('/api/test2').subscribe();

        // Verify
        const req1 = httpMock.expectOne('/api/test1');
        const req2 = httpMock.expectOne('/api/test2');

        expect(authStoreMock.getToken).toHaveBeenCalledTimes(2);
        req1.flush({});
        req2.flush({});
    });
});
