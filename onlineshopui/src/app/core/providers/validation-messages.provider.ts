import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ValidationMessages, ValidationMessagesMap } from '../types/providers/validation-messages';

export const provideValidationMessages = (messages: ValidationMessagesMap): EnvironmentProviders =>
    makeEnvironmentProviders([
        {
            provide: ValidationMessages,
            useValue: messages
        }
    ]);
