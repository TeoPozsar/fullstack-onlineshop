import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
    AppLanguage,
    AppLanguages,
    DefaultAppLanguage
} from '../config/constants/i18n.constants';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly document = inject(DOCUMENT);
    private readonly translocoService = inject(TranslocoService);
    private readonly LANGUAGE_KEY = 'language';

    private readonly _activeLanguage = signal<AppLanguage>(this.getInitialLanguage());

    readonly activeLanguage = this._activeLanguage.asReadonly();
    readonly availableLanguages: readonly AppLanguage[] = AppLanguages;

    constructor() {
        const language = this._activeLanguage();
        this.translocoService.setActiveLang(language);
        this.applyHtmlLangAttribute(language);
    }

    setLanguage(lang: AppLanguage): void {
        this._activeLanguage.set(lang);
        this.translocoService.setActiveLang(lang);
        this.applyHtmlLangAttribute(lang);

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.LANGUAGE_KEY, lang);
        }
    }

    private applyHtmlLangAttribute(lang: AppLanguage): void {
        if (typeof document === 'undefined') {
            return;
        }

        this.document.documentElement.lang = lang;
    }

    private getInitialLanguage(): AppLanguage {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return DefaultAppLanguage;
        }

        const stored = localStorage.getItem(this.LANGUAGE_KEY);
        if (stored && AppLanguages.includes(stored as AppLanguage)) {
            return stored as AppLanguage;
        }

        return DefaultAppLanguage;
    }
}
