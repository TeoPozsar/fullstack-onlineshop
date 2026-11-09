import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
    const authStore = inject(AuthStore);
    const token = authStore.getToken();

    if (!token) {
        return next(request);
    }

    const authorizedRequest = request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    return next(authorizedRequest);
};
