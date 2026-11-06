import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppLanguage } from '../../../core/config/constants/i18n.constants';
import { LanguageService } from '../../../core/services/language.service';

@Component({
    selector: 'app-language-switcher',
    imports: [TranslocoPipe],
    templateUrl: './language-switcher.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
    private readonly languageService = inject(LanguageService);

    readonly activeLanguage = this.languageService.activeLanguage;
    readonly availableLanguages = this.languageService.availableLanguages;

    selectLanguage(lang: AppLanguage): void {
        this.languageService.setLanguage(lang);
    }
}
