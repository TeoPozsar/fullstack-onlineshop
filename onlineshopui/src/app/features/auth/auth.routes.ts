import { Routes } from '@angular/router';
import { guestGuard } from './guards/guest.guard';
import { AppNavRoutes } from '../../core/config/constants/navigation.constants';

export const AuthRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: AppNavRoutes.Auth.features.login,
                canActivate: [guestGuard],
                loadComponent: () =>
                    import('./components/login-page/login-page.component').then(
                        mod => mod.LoginPageComponent
                    )
            },
            {
                path: AppNavRoutes.Auth.features.register,
                canActivate: [guestGuard],
                loadComponent: () =>
                    import('./components/register-page/register-page.component').then(
                        mod => mod.RegisterPageComponent
                    )
            }
        ]
    }
];
