import { inject, Injectable } from '@angular/core';
import { CartStore } from '../store/cart.store';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly cartStore = inject(CartStore);

    readonly items = this.cartStore.items;
    readonly totalItems = this.cartStore.totalItems;

    addItem(productId: string, quantity: number): void {
        this.cartStore.addItem(productId, quantity);
    }

    updateQuantity(productId: string, quantity: number): void {
        this.cartStore.updateQuantity(productId, quantity);
    }

    removeItem(productId: string): void {
        this.cartStore.removeItem(productId);
    }

    clear(): void {
        this.cartStore.clear();
    }
}
