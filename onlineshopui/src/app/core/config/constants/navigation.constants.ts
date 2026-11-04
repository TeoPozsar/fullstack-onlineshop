export const AppNavRoutes = {
    Auth: { root: 'auth', features: { login: 'login', register: 'register' } },
    Cart: { root: 'cart', features: { overview: 'overview' } },
    Products: {
        root: 'products',
        features: { overview: 'overview', create: 'create', update: 'update' }
    },
    Orders: {
        root: 'orders',
        features: { overview: 'overview', details: 'details' }
    }
} as const;
