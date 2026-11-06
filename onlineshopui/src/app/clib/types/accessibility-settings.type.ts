export type AccessibilityFontSize = 'small' | 'medium' | 'large' | 'extra-large';

export type AccessibilitySettings = {
    fontSize: AccessibilityFontSize;
    highContrast: boolean;
    reducedMotion: boolean;
};
