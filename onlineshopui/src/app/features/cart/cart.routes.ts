import { Routes } from '@angular/router';
import { AppNavRoutes } from '../../core/config/constants/navigation.constants';

export const CartRoutes: Routes = [
    {
        path: AppNavRoutes.Cart.features.overview,
        loadComponent: () =>
            import('./components/pages/cart-overview-page/cart-overview-page.component').then(
                m => m.CartOverviewPageComponent
            )
    },
    {
        path: '',
        redirectTo: AppNavRoutes.Cart.features.overview,
        pathMatch: 'full'
    }
];
