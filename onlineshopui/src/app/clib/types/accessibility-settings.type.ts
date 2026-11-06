export type AccessibilityFontSize = 'small' | 'medium' | 'large' | 'extra-large';

export interface AccessibilitySettings {
    fontSize: AccessibilityFontSize;
    highContrast: boolean;
    reducedMotion: boolean;
}
