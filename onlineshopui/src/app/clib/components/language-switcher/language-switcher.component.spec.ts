import { Pipe, PipeTransform, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LanguageService } from '../../../core/services/language.service';
import { LanguageSwitcherComponent } from './language-switcher.component';

@Pipe({
    name: 'transloco',
    standalone: true
})
class MockTranslocoPipe implements PipeTransform {
    transform(value: string): string {
        return value;
    }
}

describe('LanguageSwitcherComponent', () => {
    let fixture: ComponentFixture<LanguageSwitcherComponent>;
    const activeLanguage = signal<'en' | 'de'>('en');
    const languageServiceMock = {
        activeLanguage: activeLanguage.asReadonly(),
        availableLanguages: ['en', 'de'] as const,
        setLanguage: vi.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LanguageSwitcherComponent],
            providers: [{ provide: LanguageService, useValue: languageServiceMock }]
        }).overrideComponent(LanguageSwitcherComponent, {
            set: { imports: [MockTranslocoPipe] }
        });

        fixture = TestBed.createComponent(LanguageSwitcherComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        languageServiceMock.setLanguage.mockReset();
        activeLanguage.set('en');
    });

    it('renders both available language options', () => {
        const buttons = fixture.nativeElement.querySelectorAll('button');

        expect(buttons).toHaveLength(2);
        expect(buttons[0].textContent.trim()).toBe('language.en');
        expect(buttons[1].textContent.trim()).toBe('language.de');
    });

    it('selects German through the language service', () => {
        const germanButton = fixture.nativeElement.querySelectorAll('button')[1];

        germanButton.click();

        expect(languageServiceMock.setLanguage).toHaveBeenCalledWith('de');
    });

    it('marks the active language as current and emphasized', () => {
        const englishButton = fixture.nativeElement.querySelectorAll('button')[0];

        expect(englishButton.getAttribute('aria-current')).toBe('true');
        expect(englishButton.classList.contains('font-semibold')).toBe(true);
    });
});
