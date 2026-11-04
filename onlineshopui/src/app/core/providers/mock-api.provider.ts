import { HttpInterceptorFn } from '@angular/common/http';
import { EnvironmentType } from '../types/providers/environment-config';
import { mockApiInterceptor } from '../mocks/interceptors/mock-api.interceptor';

export function getMockInterceptors(envType?: EnvironmentType): HttpInterceptorFn[] {
    if (envType === 'mock') {
        return [mockApiInterceptor];
    }

    return [];
}
