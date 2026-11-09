import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthStore } from '../../store/auth.store';
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
    private readonly authStore = inject(AuthStore);
    readonly isSubmitting = this.authStore.loading;
    readonly errorMessage = computed(() =>
        this.authStore.error() ? 'Unable to create account. Please try again.' : null
    );

    readonly form = createRegisterForm();

    readonly loginLink = ['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.login];

    onSubmit() {
        if (this.form.invalid || this.isSubmitting()) {
            this.form.markAllAsTouched();
            return;
        }

        const payload = this.form.getRawValue();

        this.authStore
            .register(payload)
            .pipe(take(1))
            .subscribe({
                next: () => undefined,
                error: error => console.error('Registration failed:', error)
            });
    }
}
