import { TranslocoService } from '@jsverse/transloco';
import { ValidationMessagesMap } from '../../types/providers/validation-messages';

export const createDefaultValidationMessages = (
    translocoService: Pick<TranslocoService, 'translate'>
): ValidationMessagesMap => ({
    required: () => translocoService.translate('validation.required'),
    min: errors => translocoService.translate('validation.min', { min: errors['min'] }),
    max: errors => translocoService.translate('validation.max', { max: errors['max'] }),
    minlength: errors =>
        translocoService.translate('validation.minlength', {
            requiredLength: errors['requiredLength']
        }),
    maxlength: errors =>
        translocoService.translate('validation.maxlength', {
            requiredLength: errors['requiredLength']
        }),
    email: () => translocoService.translate('validation.email'),
    pattern: () => translocoService.translate('validation.pattern'),
    url: () => translocoService.translate('validation.url'),
    unknown: errors => translocoService.translate('validation.unknown', { key: errors['key'] })
});
