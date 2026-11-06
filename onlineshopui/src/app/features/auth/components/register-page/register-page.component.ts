import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppNavRoutes } from '../../../../core/config/constants/navigation.constants';
import { createRegisterForm } from '../../utils/register-form.utils';
import { ErrorMessageComponent } from '../../../../clib/components/error-message/error-message.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-register-page',
    imports: [ReactiveFormsModule, RouterLink, ErrorMessageComponent, TranslocoPipe],
    templateUrl: './register-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {
    private readonly authService = inject(AuthService);
    private readonly translocoService = inject(TranslocoService);
    readonly isSubmitting = signal(false);
    private readonly errorKey = signal<string | null>(null);
    private readonly languageChanges = toSignal(this.translocoService.langChanges$, {
        initialValue: this.translocoService.getActiveLang()
    });
    readonly errorMessage = computed(() => {
        this.languageChanges();
        const key = this.errorKey();
        return key ? this.translocoService.translate(key) : null;
    });

    readonly form = createRegisterForm();

    readonly loginLink = ['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.login];

    onSubmit() {
        this.errorKey.set(null);

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
                    this.errorKey.set('auth.errors.registrationFailed');
                }
            });
    }
}
