import { TranslocoTestingModule } from '@jsverse/transloco';

export const translocoTestingImports = [
    TranslocoTestingModule.forRoot({
        langs: {
            en: {
                orders: {
                    actions: { backToOrders: 'Back to Orders', tryAgain: 'Try Again' },
                    labels: {
                        order: 'Order',
                        items: 'Items',
                        total: 'Total',
                        shipTo: 'Ship To',
                        addressUnavailable: 'Address unavailable',
                        quantity: 'Qty'
                    }
                }
            },
            de: {
                orders: {
                    actions: { backToOrders: 'Zurück zu Bestellungen', tryAgain: 'Erneut versuchen' },
                    labels: {
                        order: 'Bestellung',
                        items: 'Artikel',
                        total: 'Gesamt',
                        shipTo: 'Lieferadresse',
                        addressUnavailable: 'Adresse nicht verfügbar',
                        quantity: 'Menge'
                    }
                }
            }
        },
        translocoConfig: {
            availableLangs: ['en', 'de'],
            defaultLang: 'en',
            reRenderOnLangChange: true
        }
    })
];
