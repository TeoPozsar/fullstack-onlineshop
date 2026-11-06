import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ThemeService } from './theme.service';
import { AccessibilitySettings } from '../types/accessibility-settings.type';

describe('ThemeService', () => {
    const accessibilityKey = 'accessibility_settings';
    const themeKey = 'theme';
    let service: ThemeService;
    let storage: Record<string, string>;
    let prefersReducedMotion: boolean;
    let prefersDarkMode: boolean;

    beforeEach(() => {
        storage = {};
        prefersReducedMotion = false;
        prefersDarkMode = false;

        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
            return storage[key] ?? null;
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
            storage[key] = value;
        });
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
            delete storage[key];
        });
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            writable: true,
            value: vi.fn((query: string) => ({
                matches: query.includes('prefers-reduced-motion')
                    ? prefersReducedMotion
                    : prefersDarkMode,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn()
            }))
        });

        document.documentElement.className = '';
        TestBed.configureTestingModule({
            providers: [ThemeService]
        });
        service = TestBed.inject(ThemeService);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.documentElement.className = '';
    });

    function createFreshService(): ThemeService {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [ThemeService]
        });
        return TestBed.inject(ThemeService);
    }

    it('should use accessibility defaults and apply their classes', () => {
        expect(service.accessibilitySettings()).toEqual({
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: false
        });
        expect(document.documentElement.classList.contains('font-size-medium')).toBe(true);
        expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
        expect(document.documentElement.classList.contains('reduced-motion')).toBe(false);
    });

    it('should load valid stored settings', () => {
        const settings: AccessibilitySettings = {
            fontSize: 'extra-large',
            highContrast: true,
            reducedMotion: true
        };
        storage[accessibilityKey] = JSON.stringify(settings);

        service = createFreshService();

        expect(service.accessibilitySettings()).toEqual(settings);
        expect(document.documentElement.classList.contains('font-size-extra-large')).toBe(true);
        expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
        expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
    });

    it('should fall back to defaults when stored settings contain malformed JSON', () => {
        storage[accessibilityKey] = '{malformed-json';

        service = createFreshService();

        expect(service.accessibilitySettings()).toEqual({
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: false
        });
    });

    it('should ignore invalid stored values and use the system motion preference', () => {
        prefersReducedMotion = true;
        storage[accessibilityKey] = JSON.stringify({
            fontSize: 'invalid',
            highContrast: 'true',
            reducedMotion: 'true'
        });

        service = createFreshService();

        expect(service.accessibilitySettings()).toEqual({
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: true
        });
    });

    it('should honor the system motion preference when no motion preference is stored', () => {
        prefersReducedMotion = true;
        storage[accessibilityKey] = JSON.stringify({ fontSize: 'large' });

        service = createFreshService();

        expect(service.accessibilitySettings()).toEqual({
            fontSize: 'large',
            highContrast: false,
            reducedMotion: true
        });
    });

    it('should update settings immediately and persist them', () => {
        service.setFontSize('small');
        service.setHighContrast(true);
        service.setReducedMotion(true);

        const expected: AccessibilitySettings = {
            fontSize: 'small',
            highContrast: true,
            reducedMotion: true
        };
        expect(service.accessibilitySettings()).toEqual(expected);
        expect(JSON.parse(storage[accessibilityKey])).toEqual(expected);
        expect(document.documentElement.classList.contains('font-size-small')).toBe(true);
        expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
        expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
    });

    it('should reset accessibility settings to defaults', () => {
        prefersReducedMotion = true;
        service.setFontSize('large');
        service.setHighContrast(true);

        service.resetAccessibilitySettings();

        expect(service.accessibilitySettings()).toEqual({
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: true
        });
        expect(storage[accessibilityKey]).toBeUndefined();
    });

    it('should keep settings functional when storage is unavailable', () => {
        vi.mocked(Storage.prototype.getItem).mockImplementation(() => {
            throw new Error('Storage unavailable');
        });
        vi.mocked(Storage.prototype.setItem).mockImplementation(() => {
            throw new Error('Storage unavailable');
        });

        service = createFreshService();
        service.setHighContrast(true);

        expect(service.accessibilitySettings().highContrast).toBe(true);
        expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    describe('dark mode', () => {
        it('should enable dark mode and persist the dark theme', () => {
            service.enableDarkMode();

            expect(service.isDarkMode()).toBe(true);
            expect(storage[themeKey]).toBe('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
            expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
        });

        it('should disable dark mode and persist the light theme', () => {
            service.enableDarkMode();

            service.disableDarkMode();

            expect(service.isDarkMode()).toBe(false);
            expect(storage[themeKey]).toBe('light');
            expect(document.documentElement.classList.contains('dark')).toBe(false);
            expect(document.documentElement.classList.contains('theme-dark')).toBe(false);
        });

        it('should toggle dark mode while preserving accessibility classes', () => {
            service.setHighContrast(true);
            service.setReducedMotion(true);

            service.toggle();

            expect(service.isDarkMode()).toBe(true);
            expect(document.documentElement.classList.contains('dark')).toBe(true);
            expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
            expect(document.documentElement.classList.contains('font-size-medium')).toBe(true);
            expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
            expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);

            service.toggle();

            expect(service.isDarkMode()).toBe(false);
            expect(document.documentElement.classList.contains('dark')).toBe(false);
            expect(document.documentElement.classList.contains('theme-dark')).toBe(false);
            expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
            expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
        });

        it('should restore the persisted dark theme on initialization', () => {
            service.enableDarkMode();

            service = createFreshService();

            expect(service.isDarkMode()).toBe(true);
            expect(storage[themeKey]).toBe('dark');
            expect(document.documentElement.classList.contains('dark')).toBe(true);
            expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
        });
    });
});
