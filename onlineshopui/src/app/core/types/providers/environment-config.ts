import { InjectionToken } from '@angular/core';

export type EnvironmentType = 'development' | 'production' | 'mock';

export type EnvironmentConfiguration = {
    production: boolean;
    apiUrl: string;
    envType?: EnvironmentType;
};

export const EnvironmentConfig = new InjectionToken<EnvironmentConfiguration>('ENVIRONMENT_CONFIG');
