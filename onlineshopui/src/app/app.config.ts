import {
    ApplicationConfig,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    inject,
    importProvidersFrom
} from '@angular/core';
import { take } from 'rxjs';
import {
    provideRouter,
    withComponentInputBinding,
    withEnabledBlockingInitialNavigation
} from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideEnvironmentConfiguration } from './core/providers/environment-config.provider';
import { authTokenInterceptor } from './features/auth/interceptors/auth-token.interceptor';
import { provideValidationMessages } from './core/providers/validation-messages.provider';
import { DefaultValidationMessages } from './core/config/constants/validation.constants';
import { getMockInterceptors } from './core/providers/mock-api.provider';
import { AuthService } from './features/auth/services/auth.service';
import { AppIcons } from './core/config/constants/icons.constants';
import { LucideAngularModule } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideEnvironmentConfiguration({
            apiUrl: environment.apiUrl,
            production: environment.production,
            envType: environment.envType
        }),
        provideHttpClient(
            withInterceptors([authTokenInterceptor, ...getMockInterceptors(environment.envType)])
        ),
        importProvidersFrom(LucideAngularModule.pick(AppIcons)),
        provideRouter(routes, withEnabledBlockingInitialNavigation(), withComponentInputBinding()),
        provideValidationMessages(DefaultValidationMessages),
        provideAppInitializer(() => {
            const authService = inject(AuthService);
            authService.loadProfileIfNeeded().pipe(take(1)).subscribe();
        })
    ]
};
