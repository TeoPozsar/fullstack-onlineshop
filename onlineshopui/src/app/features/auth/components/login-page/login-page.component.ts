import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthStore } from '../../store/auth.store';
import { AppNavRoutes } from '../../../../core/config/constants/navigation.constants';
import { createLoginForm } from '../../utils/login-form.utils';
import { ErrorMessageComponent } from '../../../../clib/components/error-message/error-message.component';

@Component({
    selector: 'app-login-page',
    imports: [ReactiveFormsModule, RouterLink, ErrorMessageComponent],
    templateUrl: './login-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
    private readonly authStore = inject(AuthStore);
    private readonly router = inject(Router);
    readonly isSubmitting = this.authStore.loading;
    readonly errorMessage = computed(() =>
        this.authStore.error() ? 'Invalid username or password.' : null
    );

    readonly form = createLoginForm();

    readonly registerLink = ['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.register];

    readonly productsOverviewLink = [
        '/',
        AppNavRoutes.Products.root,
        AppNavRoutes.Products.features.overview
    ];

    onSubmit() {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const credentials = this.form.getRawValue();

        this.authStore
            .login(credentials)
            .pipe(take(1))
            .subscribe({
                next: () => this.router.navigate(this.productsOverviewLink),
                error: error => console.error('Login failed:', error)
            });
    }
}
