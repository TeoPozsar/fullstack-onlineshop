import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);

    if (authService.isAuthenticated()) {
        return true;
    }

    const router = inject(Router);

    return router.createUrlTree(['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.login]);
};
