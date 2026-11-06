import { AppLanguage } from '../config/constants/i18n.constants';

export const LocaleMap: Record<AppLanguage, string> = {
    en: 'en-US',
    de: 'de-DE'
};

export function formatCurrency(amount: number, lang: AppLanguage): string {
    return new Intl.NumberFormat(LocaleMap[lang], {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

export function formatDate(value: string | Date, lang: AppLanguage): string {
    return new Intl.DateTimeFormat(LocaleMap[lang], { dateStyle: 'medium' }).format(new Date(value));
}
