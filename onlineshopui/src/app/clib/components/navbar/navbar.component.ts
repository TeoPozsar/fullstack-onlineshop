import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    OnInit,
    signal
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive, IconComponent],
    templateUrl: './navbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
    readonly authService = inject(AuthService);
    readonly themeService = inject(ThemeService);

    readonly showMobileMenu = signal(false);
    readonly userEmail = computed(() => {
        const user = this.authService.getUser();
        return user()?.email ?? null;
    });

    readonly productsRootLink = ['/', AppNavRoutes.Products.root];
    readonly ordersLink = ['/', AppNavRoutes.Orders.root, AppNavRoutes.Orders.features.overview];
    readonly cartLink = ['/', AppNavRoutes.Cart.root, AppNavRoutes.Cart.features.overview];
    readonly loginLink = ['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.login];
    readonly registerLink = ['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.register];

    ngOnInit(): void {
        this.authService.loadProfileIfNeeded().pipe(take(1)).subscribe();
    }

    toggleTheme(): void {
        this.themeService.toggle();
    }

    toggleMobileMenu(): void {
        this.showMobileMenu.update(v => !v);
    }

    closeMobileMenu(): void {
        this.showMobileMenu.set(false);
    }

    logout(): void {
        this.authService.logout();
        this.closeMobileMenu();
    }
}
