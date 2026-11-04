import { ChevronLeft, LucideIconData, Menu, Minus, Moon, Plus, Sun, X } from 'lucide-angular';

export type IconName = 'sun' | 'moon' | 'menu' | 'x' | 'chevron-left' | 'minus' | 'plus';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

export const AppIcons: Record<IconName, LucideIconData> = {
    sun: Sun,
    moon: Moon,
    menu: Menu,
    x: X,
    'chevron-left': ChevronLeft,
    minus: Minus,
    plus: Plus
};

export const AppIconSizePixels: Record<IconSize, number> = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28
};
