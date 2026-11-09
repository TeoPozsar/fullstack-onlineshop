import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOrderDto, OrderDto } from '../../../core/types/dtos/order.dto';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private readonly http = inject(HttpClient);
    private readonly environmentConfig = inject(EnvironmentConfig);
    private readonly ordersUrl = `${this.environmentConfig.apiUrl}/orders`;

    loadAll(): Observable<OrderDto[]> {
        return this.http.get<OrderDto[]>(this.ordersUrl);
    }

    loadById(id: string): Observable<OrderDto> {
        return this.http.get<OrderDto>(`${this.ordersUrl}/${id}`);
    }

    create(order: CreateOrderDto): Observable<OrderDto> {
        return this.http.post<OrderDto>(this.ordersUrl, order);
    }
}
