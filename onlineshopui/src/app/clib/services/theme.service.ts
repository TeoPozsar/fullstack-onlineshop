import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly document = inject(DOCUMENT);
    private readonly THEME_KEY = 'theme';
    private readonly DARK_CLASS = 'dark';
    private readonly THEME_DARK_CLASS = 'theme-dark';

    private readonly _isDarkMode = signal<boolean>(this.getInitialTheme());

    readonly isDarkMode = this._isDarkMode.asReadonly();

    constructor() {
        this.applyTheme(this._isDarkMode());
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

    private getInitialTheme(): boolean {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return false;
        }

        const stored = localStorage.getItem(this.THEME_KEY);
        if (stored !== null) {
            return stored === 'dark';
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    private applyTheme(isDark: boolean): void {
        if (typeof document === 'undefined') {
            return;
        }

        if (isDark) {
            this.document.documentElement.classList.add(this.DARK_CLASS, this.THEME_DARK_CLASS);
        } else {
            this.document.documentElement.classList.remove(this.DARK_CLASS, this.THEME_DARK_CLASS);
        }
    }

    private persistTheme(isDark: boolean): void {
        if (typeof localStorage === 'undefined') {
            return;
        }

        localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    }
}
