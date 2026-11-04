import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { handleAuthFeature } from './handlers/auth-handler.mock';
import { handleOrdersFeature } from './handlers/orders-handler.mock';
import { handleProductsFeature } from './handlers/products-handler.mock';

const MOCK_API_URL = 'http://mock-api';

const MOCK_DELAY_MS = 300;

export const mockApiInterceptor: HttpInterceptorFn = (request, next) => {
    const url = request.url;

    if (!url.startsWith(MOCK_API_URL)) {
        return next(request);
    }

    const path = url.substring(MOCK_API_URL.length);
    const method = request.method;

    const authContext = {
        method,
        path,
        body: request.body,
        authHeader: request.headers.get('Authorization')
    };
    const authResponse = handleAuthFeature(authContext);

    if (authResponse) {
        logMockResponse(authContext, authResponse);
        return toDelayedResponse(authResponse);
    }

    const productsContext = {
        method,
        path,
        body: request.body
    };
    const productsResponse = handleProductsFeature(productsContext);

    if (productsResponse) {
        logMockResponse(productsContext, productsResponse);
        return toDelayedResponse(productsResponse);
    }

    const ordersContext = {
        method,
        path,
        body: request.body
    };
    const ordersResponse = handleOrdersFeature(ordersContext);

    if (ordersResponse) {
        logMockResponse(ordersContext, ordersResponse);
        return toDelayedResponse(ordersResponse);
    }

    return next(request);
};

function toDelayedResponse<T>(response: HttpResponse<T>) {
    return of(response).pipe(delay(MOCK_DELAY_MS));
}

function logMockResponse(
    context: { method: string; path: string; body: unknown; authHeader?: string | null },
    response: HttpResponse<unknown>
): void {
    console.debug('[mock-api] request', {
        method: context.method,
        path: context.path,
        body: context.body,
        hasAuthHeader: Boolean(context.authHeader)
    });
    console.debug('[mock-api] response', {
        status: response.status,
        statusText: response.statusText,
        body: response.body
    });
}
