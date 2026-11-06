import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, tap, finalize, catchError, of, map } from 'rxjs';
import { CreateOrderDto, OrderDto } from '../../../core/types/dtos/order.dto';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private readonly http = inject(HttpClient);
    private readonly environmentConfig = inject(EnvironmentConfig);
    private readonly translocoService = inject(TranslocoService);
    private readonly languageChanges = toSignal(
        this.translocoService.langChanges$ ?? of('en'),
        { initialValue: 'en' }
    );
    private readonly ordersUrl = `${this.environmentConfig.apiUrl}/orders`;

    private readonly _orders = signal<OrderDto[]>([]);
    private readonly _selectedOrder = signal<OrderDto | null>(null);
    private readonly _loading = signal(false);
    private readonly _errorKey = signal<string | null>(null);

    readonly orders = this._orders.asReadonly();
    readonly selectedOrder = this._selectedOrder.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly errorKey = this._errorKey.asReadonly();
    readonly error = computed(() => {
        this.languageChanges();
        const key = this._errorKey();
        return key ? this.translocoService.translate(key) : null;
    });

    loadAll(): Observable<void> {
        this._loading.set(true);
        this._errorKey.set(null);

        return this.http.get<OrderDto[]>(this.ordersUrl).pipe(
            tap(orders => this._orders.set(orders)),
            tap(() => this._errorKey.set(null)),
            catchError(() => {
                this._errorKey.set('orders.errors.loadAll');
                return of([]);
            }),
            finalize(() => this._loading.set(false)),
            map(() => undefined)
        );
    }

    loadById(id: string): Observable<void> {
        this._loading.set(true);
        this._errorKey.set(null);

        return this.http.get<OrderDto>(`${this.ordersUrl}/${id}`).pipe(
            tap(order => this._selectedOrder.set(order)),
            tap(() => this._errorKey.set(null)),
            catchError(() => {
                this._errorKey.set('orders.errors.loadOne');
                this._selectedOrder.set(null);
                return of(null);
            }),
            finalize(() => this._loading.set(false)),
            map(() => undefined)
        );
    }

    create(order: CreateOrderDto): Observable<OrderDto> {
        return this.http.post<OrderDto>(this.ordersUrl, order).pipe(
            tap(created => {
                this._orders.update(existing => [created, ...existing]);
            })
        );
    }

    clearSelectedOrder(): void {
        this._selectedOrder.set(null);
    }
}
