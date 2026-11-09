import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { CartItem } from '../types/cart-item.type';
import { CartStorage } from '../types/cart-storage.type';

// Keep the public state contract as an interface for store consumers.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface CartState {
    items: CartItem[];
    loading: boolean;
    error: string | null;
    hydrationLoading: boolean;
    hydrationError: string | null;
    persistenceLoading: boolean;
    persistenceError: string | null;
}

type CartHydrationResult = {
    items: CartItem[];
    error: string | null;
};

const STORAGE_KEY = 'cart_state';
const STORAGE_ERROR = 'Failed to restore cart';
const PERSISTENCE_ERROR = 'Failed to persist cart';

function isCartItem(value: unknown): value is CartItem {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const item = value as Partial<CartItem>;
    return (
        typeof item.productId === 'string' &&
        item.productId.length > 0 &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
    );
}

function readFromStorage(): CartHydrationResult {
    if (typeof window === 'undefined') {
        return { items: [], error: null };
    }

    let raw: string | null;
    try {
        raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return { items: [], error: STORAGE_ERROR };
    }

    if (!raw) {
        return { items: [], error: null };
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !('items' in parsed)) {
            return { items: [], error: null };
        }

        const items = (parsed as CartStorage).items;
        if (!Array.isArray(items)) {
            return { items: [], error: null };
        }

        return {
            items: items.filter(isCartItem),
            error: null
        };
    } catch {
        return { items: [], error: STORAGE_ERROR };
    }
}

function createInitialState(): CartState {
    const hydration = readFromStorage();
    return {
        items: hydration.items,
        loading: false,
        error: hydration.error,
        hydrationLoading: false,
        hydrationError: hydration.error,
        persistenceLoading: false,
        persistenceError: null
    };
}

export const CartStore = signalStore(
    { providedIn: 'root' },
    withState<CartState>(createInitialState),
    withComputed(({ items }) => ({
        totalItems: computed(() => items().reduce((total, item) => total + item.quantity, 0)),
        hasItems: computed(() => items().length > 0)
    })),
    withMethods(store => {
        const persistToStorage = (items: CartItem[]): void => {
            if (typeof window === 'undefined') {
                patchState(store, {
                    loading: false,
                    persistenceLoading: false,
                    persistenceError: null,
                    error: null
                });
                return;
            }

            patchState(store, {
                loading: true,
                error: null,
                persistenceLoading: true,
                persistenceError: null
            });

            try {
                const payload: CartStorage = { items };
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            } catch {
                patchState(store, {
                    error: PERSISTENCE_ERROR,
                    persistenceError: PERSISTENCE_ERROR
                });
            } finally {
                patchState(store, {
                    loading: false,
                    persistenceLoading: false
                });
            }
        };

        const restoreFromStorage = (): void => {
            patchState(store, {
                loading: true,
                error: null,
                hydrationLoading: true,
                hydrationError: null
            });

            const hydration = readFromStorage();
            patchState(store, {
                items: hydration.items,
                loading: false,
                error: hydration.error,
                hydrationLoading: false,
                hydrationError: hydration.error
            });
        };

        const updateItems = (items: CartItem[]): void => {
            patchState(store, { items });
            persistToStorage(items);
        };

        const removeItem = (productId: string): void => {
            updateItems(store.items().filter(item => item.productId !== productId));
        };

        return {
            addItem(productId: string, quantity: number): void {
                if (quantity <= 0) {
                    return;
                }

                const existing = store.items().find(item => item.productId === productId);
                const items = existing
                    ? store.items().map(item =>
                          item.productId === productId
                              ? { ...item, quantity: item.quantity + quantity }
                              : item
                      )
                    : [...store.items(), { productId, quantity }];

                updateItems(items);
            },
            updateQuantity(productId: string, quantity: number): void {
                if (quantity <= 0) {
                    removeItem(productId);
                    return;
                }

                updateItems(
                    store
                        .items()
                        .map(item => (item.productId === productId ? { ...item, quantity } : item))
                );
            },
            removeItem,
            clear(): void {
                updateItems([]);
            },
            restore(): void {
                restoreFromStorage();
            }
        };
    })
);
