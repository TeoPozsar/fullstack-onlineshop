export const AppLanguages = ['en', 'de'] as const;

export type AppLanguage = (typeof AppLanguages)[number];

export const DefaultAppLanguage: AppLanguage = 'en';
