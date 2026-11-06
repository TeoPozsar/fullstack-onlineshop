import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    ValidationMessages,
    ValidationMessagesMap
} from '../../../core/types/providers/validation-messages';

@Component({
    selector: 'app-error-message',
    standalone: true,
    template: `
        @if (errorMessage()) {
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errorMessage() }}
            </p>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMessageComponent {
    control = input.required<AbstractControl | null>();

    private readonly validationMessages = inject<ValidationMessagesMap>(ValidationMessages);
    private readonly translocoService = inject(TranslocoService);
    private readonly languageChange = toSignal(this.translocoService.langChanges$, {
        initialValue: this.translocoService.getActiveLang()
    });

    errorMessage = computed(() => {
        this.languageChange();
        const ctrl = this.control();
        if (!ctrl?.errors || !ctrl.touched) {
            return null;
        }

        const errorKeys = Object.keys(ctrl.errors);
        if (errorKeys.length === 0) {
            return null;
        }

        const firstErrorKey = errorKeys[0];
        const messageFunction = this.validationMessages[firstErrorKey];

        if (!messageFunction) {
            return this.translocoService.translate('validation.unknown', {
                key: firstErrorKey
            });
        }

        return messageFunction(ctrl.errors[firstErrorKey]);
    });
}
