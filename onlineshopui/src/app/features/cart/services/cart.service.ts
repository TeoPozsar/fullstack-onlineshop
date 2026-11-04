import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../types/cart-item.type';
import { CartStorage } from '../types/cart-storage.type';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly STORAGE_KEY = 'cart_state';

    private readonly _items = signal<CartItem[]>(this.readFromStorage());

    readonly items = this._items.asReadonly();
    readonly totalItems = computed(() =>
        this._items().reduce((total, item) => total + item.quantity, 0)
    );

    addItem(productId: string, quantity: number): void {
        if (quantity <= 0) return;

        this._items.update(items => {
            const existing = items.find(item => item.productId === productId);
            if (!existing) {
                return [...items, { productId, quantity }];
            }

            return items.map(item =>
                item.productId === productId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            );
        });

        this.persistToStorage();
    }

    updateQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.removeItem(productId);
            return;
        }

        this._items.update(items =>
            items.map(item => (item.productId === productId ? { ...item, quantity } : item))
        );

        this.persistToStorage();
    }

    removeItem(productId: string): void {
        this._items.update(items => items.filter(item => item.productId !== productId));
        this.persistToStorage();
    }

    clear(): void {
        this._items.set([]);
        this.persistToStorage();
    }

    private readFromStorage(): CartItem[] {
        if (typeof window === 'undefined') {
            return [];
        }

        const raw = window.localStorage.getItem(this.STORAGE_KEY);
        if (!raw) {
            return [];
        }

        try {
            const parsed = JSON.parse(raw) as CartStorage;
            if (!parsed?.items?.length) {
                return [];
            }

            return parsed.items.filter(item => item.productId && item.quantity > 0);
        } catch {
            return [];
        }
    }

    private persistToStorage(): void {
        if (typeof window === 'undefined') {
            return;
        }

        const payload: CartStorage = {
            items: this._items()
        };

        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    }
}
