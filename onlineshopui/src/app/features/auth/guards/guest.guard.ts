import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';

export const guestGuard: CanActivateFn = () => {
    const authStore = inject(AuthStore);

    if (!authStore.isAuthenticated()) {
        return true;
    }

    const router = inject(Router);

    return router.createUrlTree([
        '/',
        AppNavRoutes.Products.root,
        AppNavRoutes.Products.features.overview
    ]);
};
