import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
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
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    readonly isSubmitting = signal(false);
    readonly errorMessage = signal<string | null>(null);

    readonly form = createLoginForm();

    readonly registerLink = ['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.register];

    readonly productsOverviewLink = [
        '/',
        AppNavRoutes.Products.root,
        AppNavRoutes.Products.features.overview
    ];

    onSubmit() {
        this.errorMessage.set(null);

        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);

        const credentials = this.form.getRawValue();

        this.authService
            .login(credentials)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                    this.router.navigate(this.productsOverviewLink);
                },
                error: () => {
                    this.isSubmitting.set(false);
                    this.errorMessage.set('Invalid username or password.');
                }
            });
    }
}
