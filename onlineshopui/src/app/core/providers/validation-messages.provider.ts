import {
    EnvironmentProviders,
    makeEnvironmentProviders,
    ProviderToken
} from '@angular/core';
import { ValidationMessages, ValidationMessagesMap } from '../types/providers/validation-messages';

export const provideValidationMessages = <T>(
    factory: (dependency: T) => ValidationMessagesMap,
    dependency: ProviderToken<T>
): EnvironmentProviders =>
    makeEnvironmentProviders([
        {
            provide: ValidationMessages,
            useFactory: factory,
            deps: [dependency]
        }
    ]);
