import { HttpClient } from '@angular/common/http';
import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { provideTransloco, TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    AppLanguages,
    DefaultAppLanguage
} from '../config/constants/i18n.constants';

@Injectable({ providedIn: 'root' })
class TranslocoHttpLoader implements TranslocoLoader {
    private readonly http = inject(HttpClient);

    getTranslation(lang: string): Observable<Record<string, unknown>> {
        return this.http.get<Record<string, unknown>>(`/i18n/${lang}.json`);
    }
}

export const provideAppTransloco = (): EnvironmentProviders =>
    makeEnvironmentProviders(
        provideTransloco({
            config: {
                availableLangs: [...AppLanguages],
                defaultLang: DefaultAppLanguage,
                reRenderOnLangChange: true,
                prodMode: environment.production
            },
            loader: TranslocoHttpLoader
        })
    );
