import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';

export const rolesGuard: CanActivateFn = route => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const requiredRoles = route.data?.['roles'] as string[] | string | undefined;

    if (!requiredRoles) {
        return true;
    }

    return authService.loadProfileIfNeeded().pipe(
        take(1),
        map(() => {
            const hasAccess = authService.hasRole(requiredRoles);

            if (hasAccess) {
                return true;
            }

            return router.createUrlTree([
                '/',
                AppNavRoutes.Products.root,
                AppNavRoutes.Products.features.overview
            ]);
        })
    );
};
