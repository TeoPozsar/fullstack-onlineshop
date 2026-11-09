import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize, catchError, of, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ProductDto,
    ProductCategoryDto,
    CreateProductRequest,
    UpdateProductRequest
} from '../../../core/types/dtos/product.dto';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import { ProductEventDto } from '../../../core/types/dtos/product-event.dto';
import { ProductWebSocketService } from './product-websocket.service';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly http = inject(HttpClient);
    private readonly environmentConfig = inject(EnvironmentConfig);
    private readonly productWebSocketService = inject(ProductWebSocketService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly productsUrl = `${this.environmentConfig.apiUrl}/products`;
    private readonly categoriesUrl = `${this.environmentConfig.apiUrl}/products/categories`;

    private readonly _products = signal<ProductDto[]>([]);
    private readonly _selectedProduct = signal<ProductDto | null>(null);
    private readonly _categories = signal<ProductCategoryDto[]>([]);
    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);
    private readonly _deletedProductId = signal<string | null>(null);
    private readonly eventIds = new Set<string>();
    private readonly productEventWatermarks = new Map<string, number>();
    private readonly productEventReceivedAt = new Map<string, number>();

    readonly products = this._products.asReadonly();
    readonly selectedProduct = this._selectedProduct.asReadonly();
    readonly categories = this._categories.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly deletedProductId = this._deletedProductId.asReadonly();

    constructor() {
        this.productWebSocketService.events
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(event => this.applyProductEvent(event));
    }

    loadAll(): Observable<void> {
        this._loading.set(true);
        this._error.set(null);

        return this.http.get<ProductDto[]>(this.productsUrl).pipe(
            tap(products => this._products.set(products)),
            tap(() => this._error.set(null)),
            catchError(() => {
                this._error.set('Failed to load products');
                return of([]);
            }),
            finalize(() => this._loading.set(false)),
            map(() => undefined)
        );
    }

    loadById(id: string): Observable<void> {
        this._loading.set(true);
        this._error.set(null);

        return this.http.get<ProductDto>(`${this.productsUrl}/${id}`).pipe(
            tap(product => {
                if (this._deletedProductId() !== id) {
                    this._selectedProduct.set(product);
                }
            }),
            tap(() => this._error.set(null)),
            catchError(() => {
                this._error.set('Failed to load product');
                this._selectedProduct.set(null);
                return of(null);
            }),
            finalize(() => this._loading.set(false)),
            map(() => undefined)
        );
    }

    loadCategories(): Observable<void> {
        this._loading.set(true);
        this._error.set(null);

        return this.http.get<ProductCategoryDto[]>(this.categoriesUrl).pipe(
            tap(categories => this._categories.set(categories)),
            tap(() => this._error.set(null)),
            catchError(() => {
                this._error.set('Failed to load categories');
                return of([]);
            }),
            finalize(() => this._loading.set(false)),
            map(() => undefined)
        );
    }

    create(data: CreateProductRequest): Observable<ProductDto> {
        const startedAt = Date.now();
        return this.http.post<ProductDto>(this.productsUrl, data).pipe(
            tap(newProduct => {
                if (!this.hasNewerProductEvent(newProduct.id, startedAt)) {
                    this.upsertProduct(newProduct);
                }
            })
        );
    }

    update(id: string, data: UpdateProductRequest): Observable<ProductDto> {
        const startedAt = Date.now();
        return this.http.put<ProductDto>(`${this.productsUrl}/${id}`, data).pipe(
            tap(updatedProduct => {
                if (!this.hasNewerProductEvent(id, startedAt)) {
                    this.upsertProduct(updatedProduct);
                }
            })
        );
    }

    delete(id: string): Observable<void> {
        const startedAt = Date.now();
        return this.http.delete<void>(`${this.productsUrl}/${id}`).pipe(
            tap(() => {
                if (!this.hasNewerProductEvent(id, startedAt)) {
                    this.removeProduct(id);
                }
            })
        );
    }

    clearSelectedProduct(): void {
        this._selectedProduct.set(null);
    }

    clearDeletedProductMarker(): void {
        this._deletedProductId.set(null);
    }

    private applyProductEvent(event: ProductEventDto): void {
        if (this.eventIds.has(event.eventId)) {
            return;
        }

        const occurredAt = Date.parse(event.occurredAt);
        const previousWatermark = this.productEventWatermarks.get(event.productId) ?? 0;
        if (Number.isNaN(occurredAt) || occurredAt < previousWatermark) {
            return;
        }

        this.eventIds.add(event.eventId);
        this.productEventWatermarks.set(event.productId, occurredAt);
        this.productEventReceivedAt.set(event.productId, Date.now());

        if (event.action === 'DELETED') {
            this._products.update(products => products.filter(product => product.id !== event.productId));
            if (this._selectedProduct()?.id === event.productId) {
                this._deletedProductId.set(event.productId);
                this._selectedProduct.set(null);
            }
            return;
        }

        const product = event.product;
        if (!product) {
            return;
        }

        this.upsertProduct(product);
    }

    private upsertProduct(product: ProductDto): void {
        this._products.update(products => {
            const existingIndex = products.findIndex(item => item.id === product.id);
            if (existingIndex < 0) {
                return [...products, product];
            }

            return products.map(item => (item.id === product.id ? product : item));
        });

        if (this._selectedProduct()?.id === product.id) {
            this._selectedProduct.set(product);
        }
    }

    private removeProduct(id: string): void {
        this._products.update(products => products.filter(product => product.id !== id));
        if (this._selectedProduct()?.id === id) {
            this._selectedProduct.set(null);
        }
    }

    private hasNewerProductEvent(id: string, startedAt: number): boolean {
        return (this.productEventReceivedAt.get(id) ?? 0) >= startedAt;
    }

}
