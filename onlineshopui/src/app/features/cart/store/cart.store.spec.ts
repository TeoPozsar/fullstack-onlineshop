import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CartStore } from './cart.store';
import { MOCK_CART_ITEMS } from '../../../core/mocks/data/cart.mock';

describe('CartStore', () => {
    let store: InstanceType<typeof CartStore>;
    let localStorageMock: Record<string, string>;

    beforeEach(() => {
        localStorageMock = {};
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
            return localStorageMock[key] ?? null;
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
            (key: string, value: string) => {
                localStorageMock[key] = value;
            }
        );

        TestBed.configureTestingModule({
            providers: [CartStore]
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        TestBed.resetTestingModule();
    });

    function injectStore(): void {
        store = TestBed.inject(CartStore);
    }

    it('initializes with explicit state and computed values', () => {
        injectStore();

        expect(store.items()).toEqual([]);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        expect(store.totalItems()).toBe(0);
        expect(store.hasItems()).toBe(false);
    });

    it('hydrates valid items from cart_state', () => {
        localStorageMock['cart_state'] = JSON.stringify({ items: MOCK_CART_ITEMS });
        injectStore();

        expect(store.items()).toEqual(MOCK_CART_ITEMS);
        expect(store.totalItems()).toBe(6);
        expect(store.hydrationError()).toBeNull();
    });

    it('uses an empty safe default for malformed or unavailable storage data', () => {
        localStorageMock['cart_state'] = '{invalid';
        injectStore();

        expect(store.items()).toEqual([]);
        expect(store.hydrationError()).toBe('Failed to restore cart');

        TestBed.resetTestingModule();
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Storage unavailable');
        });
        TestBed.configureTestingModule({ providers: [CartStore] });
        const unavailableStore = TestBed.inject(CartStore);

        expect(unavailableStore.items()).toEqual([]);
        expect(unavailableStore.totalItems()).toBe(0);
        expect(unavailableStore.error()).toBe('Failed to restore cart');
    });

    it('filters invalid stored entries and keeps valid entries', () => {
        localStorageMock['cart_state'] = JSON.stringify({
            items: [
                { productId: 'prod-1', quantity: 2 },
                null,
                { productId: '', quantity: 1 },
                { productId: 'prod-2', quantity: 0 },
                { productId: 'prod-3', quantity: -1 },
                { productId: 'prod-4', quantity: '2' }
            ]
        });
        injectStore();

        expect(store.items()).toEqual([{ productId: 'prod-1', quantity: 2 }]);
    });

    it('applies quantity rules and persists each mutation in the existing format', () => {
        injectStore();

        store.addItem('prod-1', 2);
        expect(store.items()).toEqual([{ productId: 'prod-1', quantity: 2 }]);
        expect(localStorageMock['cart_state']).toBe(
            JSON.stringify({ items: [{ productId: 'prod-1', quantity: 2 }] })
        );

        store.addItem('prod-1', 3);
        store.addItem('prod-2', 1);
        store.updateQuantity('prod-1', 5);
        expect(store.totalItems()).toBe(6);

        store.updateQuantity('prod-1', 0);
        expect(store.items()).toEqual([{ productId: 'prod-2', quantity: 1 }]);

        store.addItem('prod-3', -1);
        expect(store.items()).toEqual([{ productId: 'prod-2', quantity: 1 }]);

        store.removeItem('prod-2');
        expect(store.items()).toEqual([]);
        expect(localStorageMock['cart_state']).toBe(JSON.stringify({ items: [] }));

        store.addItem('prod-4', 2);
        store.clear();
        expect(store.items()).toEqual([]);
        expect(localStorageMock['cart_state']).toBe(JSON.stringify({ items: [] }));
        expect(store.persistenceLoading()).toBe(false);
        expect(store.loading()).toBe(false);
    });

    it('restores current storage contents synchronously when requested', () => {
        injectStore();
        store.addItem('prod-1', 1);
        localStorageMock['cart_state'] = JSON.stringify({
            items: [{ productId: 'prod-2', quantity: 4 }]
        });

        store.restore();

        expect(store.items()).toEqual([{ productId: 'prod-2', quantity: 4 }]);
        expect(store.totalItems()).toBe(4);
        expect(store.hydrationLoading()).toBe(false);
    });

    it('records persistence failures without losing in-memory cart state', () => {
        injectStore();
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('Storage unavailable');
        });

        store.addItem('prod-1', 2);

        expect(store.items()).toEqual([{ productId: 'prod-1', quantity: 2 }]);
        expect(store.persistenceError()).toBe('Failed to persist cart');
        expect(store.error()).toBe('Failed to persist cart');
        expect(store.loading()).toBe(false);
    });
});
