import { TranslocoTestingModule } from '@jsverse/transloco';

export const translocoTestingImports = [
    TranslocoTestingModule.forRoot({
        langs: { en: {}, de: {} },
        translocoConfig: {
            availableLangs: ['en', 'de'],
            defaultLang: 'en',
            reRenderOnLangChange: true
        }
    })
];
