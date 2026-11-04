import { EnvironmentConfig, EnvironmentConfiguration } from '../types/providers/environment-config';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

export const provideEnvironmentConfiguration = (
    configuration: EnvironmentConfiguration
): EnvironmentProviders =>
    makeEnvironmentProviders([
        {
            provide: EnvironmentConfig,
            useValue: configuration
        }
    ]);
