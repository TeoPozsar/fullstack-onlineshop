import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppNavRoutes } from '../../../../core/config/constants/navigation.constants';
import { createRegisterForm } from '../../utils/register-form.utils';
import { ErrorMessageComponent } from '../../../../clib/components/error-message/error-message.component';

@Component({
    selector: 'app-register-page',
    imports: [ReactiveFormsModule, RouterLink, ErrorMessageComponent],
    templateUrl: './register-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {
    private readonly authService = inject(AuthService);
    readonly isSubmitting = signal(false);
    readonly errorMessage = signal<string | null>(null);

    readonly form = createRegisterForm();

    readonly loginLink = ['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.login];

    onSubmit() {
        this.errorMessage.set(null);

        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);

        const payload = this.form.getRawValue();

        this.authService
            .register(payload)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.isSubmitting.set(false);
                },
                error: () => {
                    this.isSubmitting.set(false);
                    this.errorMessage.set('Unable to create account. Please try again.');
                }
            });
    }
}
