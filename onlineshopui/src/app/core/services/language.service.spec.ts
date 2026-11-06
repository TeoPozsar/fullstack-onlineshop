import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { vi } from 'vitest';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
    let translocoServiceMock: {
        setActiveLang: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        localStorage.clear();
        translocoServiceMock = {
            setActiveLang: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                LanguageService,
                { provide: TranslocoService, useValue: translocoServiceMock }
            ]
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('defaults to English when no language is persisted', () => {
        const service = TestBed.inject(LanguageService);

        expect(service.activeLanguage()).toBe('en');
        expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('en');
        expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    });

    it('restores a persisted German language', () => {
        localStorage.setItem('language', 'de');

        const service = TestBed.inject(LanguageService);

        expect(service.activeLanguage()).toBe('de');
        expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('de');
        expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('de');
    });

    it('falls back to English for an unsupported persisted language', () => {
        localStorage.setItem('language', 'fr');

        const service = TestBed.inject(LanguageService);

        expect(service.activeLanguage()).toBe('en');
        expect(translocoServiceMock.setActiveLang).toHaveBeenCalledWith('en');
    });

    it('updates the language, Transloco, html lang, and persistence', () => {
        const service = TestBed.inject(LanguageService);

        service.setLanguage('de');

        expect(service.activeLanguage()).toBe('de');
        expect(translocoServiceMock.setActiveLang).toHaveBeenLastCalledWith('de');
        expect(localStorage.getItem('language')).toBe('de');
        expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('de');
    });
});
