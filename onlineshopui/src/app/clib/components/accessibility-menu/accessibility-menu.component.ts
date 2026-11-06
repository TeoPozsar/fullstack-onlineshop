import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    inject,
    Injector,
    signal,
    ViewChild
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { _IdGenerator } from '@angular/cdk/a11y';
import { ThemeService } from '../../services/theme.service';
import {
    AccessibilityFontSize
} from '../../types/accessibility-settings.type';

@Component({
    selector: 'app-accessibility-menu',
    standalone: true,
    imports: [TitleCasePipe],
    templateUrl: './accessibility-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityMenuComponent {
    readonly themeService = inject(ThemeService);
    private readonly idGenerator = inject(_IdGenerator);
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly injector = inject(Injector);

    readonly panelId = this.idGenerator.getId('accessibility-menu-panel-');
    readonly titleId = this.idGenerator.getId('accessibility-menu-title-');
    @ViewChild('trigger') private trigger?: ElementRef<HTMLButtonElement>;
    @ViewChild('firstControl') private firstControl?: ElementRef<HTMLInputElement>;

    readonly isOpen = signal(false);
    readonly fontSizeOptions: AccessibilityFontSize[] = [
        'small',
        'medium',
        'large',
        'extra-large'
    ];

    toggleMenu(): void {
        if (this.isOpen()) {
            this.closeMenu();
            return;
        }

        this.isOpen.set(true);
        afterNextRender(
            () => {
                this.firstControl?.nativeElement.focus();
            },
            { injector: this.injector }
        );
    }

    onTriggerKeydown(event: Event): void {
        event.preventDefault();
        this.toggleMenu();
    }

    closeMenu(): void {
        if (!this.isOpen()) {
            return;
        }

        this.isOpen.set(false);
        afterNextRender(
            () => {
                this.trigger?.nativeElement.focus();
            },
            { injector: this.injector }
        );
    }

    setFontSize(fontSize: AccessibilityFontSize): void {
        this.themeService.setFontSize(fontSize);
    }

    toggleHighContrast(): void {
        this.themeService.toggleHighContrast();
    }

    toggleReducedMotion(): void {
        this.themeService.toggleReducedMotion();
    }

    resetSettings(): void {
        this.themeService.resetAccessibilitySettings();
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        this.closeMenu();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
            this.closeMenu();
        }
    }
}
