import { ValidationMessagesMap } from '../../types/providers/validation-messages';

export const DefaultValidationMessages: ValidationMessagesMap = {
    required: () => 'This field is required',
    min: errors => `Minimum value is ${errors['min']}`,
    max: errors => `Maximum value is ${errors['max']}`,
    minlength: errors => `Minimum length is ${errors['requiredLength']} characters`,
    maxlength: errors => `Maximum length is ${errors['requiredLength']} characters`,
    email: () => 'Please enter a valid email address',
    pattern: () => 'Please enter a valid format',
    url: () => 'Please enter a valid URL'
};
