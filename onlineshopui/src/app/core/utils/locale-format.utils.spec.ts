import { formatCurrency, formatDate } from './locale-format.utils';

describe('locale format utilities', () => {
    it('formats currency with English separators', () => {
        expect(formatCurrency(1234.5, 'en')).toContain('$1,234.50');
    });

    it('formats currency with German separators', () => {
        const formatted = formatCurrency(1234.5, 'de');

        expect(formatted).toContain('1.234,50');
        expect(formatted).toContain('$');
    });

    it('formats dates for English and German locales', () => {
        const value = '2026-11-06T00:00:00.000Z';

        expect(formatDate(value, 'en')).toContain('Nov');
        expect(formatDate(value, 'de')).toMatch(/06\.11\.2026/);
    });
});
