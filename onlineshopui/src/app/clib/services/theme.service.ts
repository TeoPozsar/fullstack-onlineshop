import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
    AccessibilityFontSize,
    AccessibilitySettings
} from '../types/accessibility-settings.type';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly document = inject(DOCUMENT);
    private readonly THEME_KEY = 'theme';
    private readonly ACCESSIBILITY_SETTINGS_KEY = 'accessibility_settings';
    private readonly DARK_CLASS = 'dark';
    private readonly THEME_DARK_CLASS = 'theme-dark';
    private readonly FONT_SIZE_CLASSES: Record<AccessibilityFontSize, string> = {
        small: 'font-size-small',
        medium: 'font-size-medium',
        large: 'font-size-large',
        'extra-large': 'font-size-extra-large'
    };
    private readonly HIGH_CONTRAST_CLASS = 'high-contrast';
    private readonly REDUCED_MOTION_CLASS = 'reduced-motion';

    private readonly _isDarkMode = signal<boolean>(this.getInitialTheme());
    private readonly _accessibilitySettings = signal<AccessibilitySettings>(
        this.getInitialAccessibilitySettings()
    );

    readonly isDarkMode = this._isDarkMode.asReadonly();
    readonly accessibilitySettings = this._accessibilitySettings.asReadonly();

    constructor() {
        this.applyTheme(this._isDarkMode());
        this.applyAccessibilitySettings(this._accessibilitySettings());
    }

    toggle(): void {
        const newValue = !this._isDarkMode();
        this._isDarkMode.set(newValue);
        this.applyTheme(newValue);
        this.persistTheme(newValue);
    }

    enableDarkMode(): void {
        this._isDarkMode.set(true);
        this.applyTheme(true);
        this.persistTheme(true);
    }

    disableDarkMode(): void {
        this._isDarkMode.set(false);
        this.applyTheme(false);
        this.persistTheme(false);
    }

    setFontSize(fontSize: AccessibilityFontSize): void {
        this.updateAccessibilitySettings({ fontSize });
    }

    setHighContrast(highContrast: boolean): void {
        this.updateAccessibilitySettings({ highContrast });
    }

    toggleHighContrast(): void {
        this.setHighContrast(!this._accessibilitySettings().highContrast);
    }

    setReducedMotion(reducedMotion: boolean): void {
        this.updateAccessibilitySettings({ reducedMotion });
    }

    toggleReducedMotion(): void {
        this.setReducedMotion(!this._accessibilitySettings().reducedMotion);
    }

    resetAccessibilitySettings(): void {
        const settings: AccessibilitySettings = {
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: this.getSystemReducedMotion()
        };
        this._accessibilitySettings.set(settings);
        this.applyAccessibilitySettings(settings);
        this.removeStorage(this.ACCESSIBILITY_SETTINGS_KEY);
    }

    private getInitialTheme(): boolean {
        const stored = this.readStorage(this.THEME_KEY);
        if (stored !== null) {
            return stored === 'dark';
        }

        return this.getSystemColorSchemePreference();
    }

    private getInitialAccessibilitySettings(): AccessibilitySettings {
        const stored = this.readStorage(this.ACCESSIBILITY_SETTINGS_KEY);
        let parsed: Partial<AccessibilitySettings> = {};

        if (stored !== null) {
            try {
                const value: unknown = JSON.parse(stored);
                if (this.isRecord(value)) {
                    parsed = value;
                }
            } catch {
                parsed = {};
            }
        }

        return {
            fontSize: this.isFontSize(parsed.fontSize) ? parsed.fontSize : 'medium',
            highContrast: this.isBoolean(parsed.highContrast) ? parsed.highContrast : false,
            reducedMotion: this.isBoolean(parsed.reducedMotion)
                ? parsed.reducedMotion
                : this.getSystemReducedMotion()
        };
    }

    private updateAccessibilitySettings(
        changes: Partial<AccessibilitySettings>
    ): void {
        const settings = { ...this._accessibilitySettings(), ...changes };
        this._accessibilitySettings.set(settings);
        this.applyAccessibilitySettings(settings);
        this.persistAccessibilitySettings(settings);
    }

    private applyTheme(isDark: boolean): void {
        if (isDark) {
            this.document.documentElement.classList.add(this.DARK_CLASS, this.THEME_DARK_CLASS);
        } else {
            this.document.documentElement.classList.remove(this.DARK_CLASS, this.THEME_DARK_CLASS);
        }
    }

    private persistTheme(isDark: boolean): void {
        this.writeStorage(this.THEME_KEY, isDark ? 'dark' : 'light');
    }

    private applyAccessibilitySettings(settings: AccessibilitySettings): void {
        const root = this.document.documentElement;
        Object.values(this.FONT_SIZE_CLASSES).forEach(className =>
            root.classList.remove(className)
        );
        root.classList.add(this.FONT_SIZE_CLASSES[settings.fontSize]);
        root.classList.toggle(this.HIGH_CONTRAST_CLASS, settings.highContrast);
        root.classList.toggle(this.REDUCED_MOTION_CLASS, settings.reducedMotion);
    }

    private persistAccessibilitySettings(settings: AccessibilitySettings): void {
        this.writeStorage(this.ACCESSIBILITY_SETTINGS_KEY, JSON.stringify(settings));
    }

    private readStorage(key: string): string | null {
        if (typeof localStorage === 'undefined') {
            return null;
        }

        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    private writeStorage(key: string, value: string): void {
        if (typeof localStorage === 'undefined') {
            return;
        }

        try {
            localStorage.setItem(key, value);
        } catch {
            // Storage can be unavailable or full; in-memory settings remain active.
        }
    }

    private removeStorage(key: string): void {
        if (typeof localStorage === 'undefined') {
            return;
        }

        try {
            localStorage.removeItem(key);
        } catch {
            // Storage can be unavailable; in-memory settings remain reset.
        }
    }

    private getSystemColorSchemePreference(): boolean {
        return typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : false;
    }

    private getSystemReducedMotion(): boolean {
        return typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false;
    }

    private isFontSize(value: unknown): value is AccessibilityFontSize {
        return (
            value === 'small' ||
            value === 'medium' ||
            value === 'large' ||
            value === 'extra-large'
        );
    }

    private isBoolean(value: unknown): value is boolean {
        return typeof value === 'boolean';
    }

    private isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null;
    }
}
