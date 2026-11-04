import { Routes } from '@angular/router';
import { AppNavRoutes } from './core/config/constants/navigation.constants';
import { authGuard } from './features/auth/guards/auth.guard';
import { RootLayoutComponent } from './clib/layouts/root-layout/root-layout.component';

export const routes: Routes = [
    {
        path: AppNavRoutes.Auth.root,
        loadChildren: () => import('./features/auth/auth.routes').then(mod => mod.AuthRoutes)
    },
    {
        path: '',
        component: RootLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: AppNavRoutes.Products.root,
                loadChildren: () =>
                    import('./features/products/products.routes').then(mod => mod.ProductsRoutes)
            },
            {
                path: AppNavRoutes.Cart.root,
                loadChildren: () =>
                    import('./features/cart/cart.routes').then(mod => mod.CartRoutes)
            },
            {
                path: AppNavRoutes.Orders.root,
                loadChildren: () =>
                    import('./features/orders/orders.routes').then(mod => mod.OrdersRoutes)
            }
        ]
    },
    {
        path: '**',
        redirectTo: `${AppNavRoutes.Products.root}/${AppNavRoutes.Products.features.overview}`
    }
];
