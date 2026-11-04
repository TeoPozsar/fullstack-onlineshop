import { Routes } from '@angular/router';
import { rolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../core/types/enums/user-roles.enum';
import { AppNavRoutes } from '../../core/config/constants/navigation.constants';

export const ProductsRoutes: Routes = [
    {
        path: AppNavRoutes.Products.features.overview,
        loadComponent: () =>
            import('./components/pages/product-catalog-page/product-catalog-page.component').then(
                m => m.ProductCatalogPageComponent
            )
    },
    {
        path: AppNavRoutes.Products.features.create,
        loadComponent: () =>
            import('./components/pages/product-create-page/product-create-page.component').then(
                m => m.ProductCreatePageComponent
            ),
        canActivate: [rolesGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: `${AppNavRoutes.Products.features.update}/:id`,
        loadComponent: () =>
            import('./components/pages/product-update-page/product-update-page.component').then(
                m => m.ProductUpdatePageComponent
            ),
        canActivate: [rolesGuard],
        data: { roles: [UserRole.ADMIN] }
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./components/pages/product-detail-page/product-detail-page.component').then(
                m => m.ProductDetailPageComponent
            )
    },
    {
        path: '',
        redirectTo: AppNavRoutes.Products.features.overview,
        pathMatch: 'full'
    }
];
