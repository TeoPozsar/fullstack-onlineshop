import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';

export const rolesGuard: CanActivateFn = route => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    const requiredRoles = route.data?.['roles'] as string[] | string | undefined;

    if (!requiredRoles) {
        return true;
    }

    return authStore.loadProfileIfNeeded().pipe(
        take(1),
        map(() => {
            const hasAccess = authStore.hasRole(requiredRoles);

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
