import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { vi } from 'vitest';
import { AppIcons } from '../../../core/config/constants/icons.constants';
import { AccessibilitySettings } from '../../types/accessibility-settings.type';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
    let fixture: ComponentFixture<NavbarComponent>;
    let authServiceMock: {
        isAuthenticated: ReturnType<typeof signal<boolean>>;
        getUser: ReturnType<typeof vi.fn>;
        loadProfileIfNeeded: ReturnType<typeof vi.fn>;
        logout: ReturnType<typeof vi.fn>;
    };
    let themeServiceMock: {
        isDarkMode: ReturnType<typeof signal<boolean>>;
        accessibilitySettings: ReturnType<typeof signal<AccessibilitySettings>>;
        toggle: ReturnType<typeof vi.fn>;
        setFontSize: ReturnType<typeof vi.fn>;
        toggleHighContrast: ReturnType<typeof vi.fn>;
        toggleReducedMotion: ReturnType<typeof vi.fn>;
        resetAccessibilitySettings: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        authServiceMock = {
            isAuthenticated: signal(false),
            getUser: vi.fn().mockReturnValue(signal(null)),
            loadProfileIfNeeded: vi.fn().mockReturnValue(of(null)),
            logout: vi.fn()
        };
        themeServiceMock = {
            isDarkMode: signal(false),
            accessibilitySettings: signal({
                fontSize: 'medium',
                highContrast: false,
                reducedMotion: false
            }),
            toggle: vi.fn(),
            setFontSize: vi.fn(),
            toggleHighContrast: vi.fn(),
            toggleReducedMotion: vi.fn(),
            resetAccessibilitySettings: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [NavbarComponent],
            providers: [
                provideRouter([]),
                provideHttpClient(),
                importProvidersFrom(LucideAngularModule.pick(AppIcons)),
                { provide: AuthService, useValue: authServiceMock },
                { provide: ThemeService, useValue: themeServiceMock }
            ]
        });

        fixture = TestBed.createComponent(NavbarComponent);
        fixture.detectChanges();
    });

    it('should render the accessibility menu in desktop and mobile navigation', () => {
        expect(fixture.nativeElement.querySelectorAll('app-accessibility-menu').length).toBe(1);

        const mobileMenuButton = fixture.nativeElement.querySelector(
            'button.md\\:hidden'
        ) as HTMLButtonElement;
        mobileMenuButton.click();
        fixture.detectChanges();

        const menus = fixture.nativeElement.querySelectorAll('app-accessibility-menu');
        const triggers = fixture.nativeElement.querySelectorAll(
            'app-accessibility-menu button'
        );

        expect(menus.length).toBe(2);
        expect(triggers.length).toBe(2);
        expect(Array.from(triggers as NodeListOf<HTMLButtonElement>).every(trigger =>
            trigger.textContent?.includes('Accessibility')
        )).toBe(true);
    });

    it('should allow the integrated menu trigger to open the accessibility panel', () => {
        const trigger = fixture.nativeElement.querySelector(
            'app-accessibility-menu button'
        ) as HTMLButtonElement;

        trigger.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('should preserve existing theme and mobile menu behavior', () => {
        fixture.componentInstance.toggleTheme();
        expect(themeServiceMock.toggle).toHaveBeenCalledOnce();

        const mobileMenuButton = fixture.nativeElement.querySelector(
            'button.md\\:hidden'
        ) as HTMLButtonElement;
        mobileMenuButton.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.showMobileMenu()).toBe(true);
        expect(fixture.nativeElement.textContent).toContain('Products');
    });
});
