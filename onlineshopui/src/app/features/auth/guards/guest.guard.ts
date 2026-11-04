import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';

export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);

    if (!authService.isAuthenticated()) {
        return true;
    }

    const router = inject(Router);

    return router.createUrlTree([
        '/',
        AppNavRoutes.Products.root,
        AppNavRoutes.Products.features.overview
    ]);
};
