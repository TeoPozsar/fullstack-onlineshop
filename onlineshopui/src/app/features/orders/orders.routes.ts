import { Routes } from '@angular/router';
import { AppNavRoutes } from '../../core/config/constants/navigation.constants';

export const OrdersRoutes: Routes = [
    {
        path: AppNavRoutes.Orders.features.overview,
        loadComponent: () =>
            import('./components/pages/orders-overview-page/orders-overview-page.component').then(
                m => m.OrdersOverviewPageComponent
            )
    },
    {
        path: `${AppNavRoutes.Orders.features.details}/:id`,
        loadComponent: () =>
            import('./components/pages/order-detail-page/order-detail-page.component').then(
                m => m.OrderDetailPageComponent
            )
    },
    {
        path: '',
        redirectTo: AppNavRoutes.Orders.features.overview,
        pathMatch: 'full'
    }
];
