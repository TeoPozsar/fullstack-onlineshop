import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    ProductDto,
    ProductCategoryDto,
    CreateProductRequest,
    UpdateProductRequest
} from '../../../core/types/dtos/product.dto';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly http = inject(HttpClient);
    private readonly environmentConfig = inject(EnvironmentConfig);
    private readonly productsUrl = `${this.environmentConfig.apiUrl}/products`;
    private readonly categoriesUrl = `${this.environmentConfig.apiUrl}/products/categories`;

    loadAll(): Observable<ProductDto[]> {
        return this.http.get<ProductDto[]>(this.productsUrl);
    }

    loadById(id: string): Observable<ProductDto> {
        return this.http.get<ProductDto>(`${this.productsUrl}/${id}`);
    }

    loadCategories(): Observable<ProductCategoryDto[]> {
        return this.http.get<ProductCategoryDto[]>(this.categoriesUrl);
    }

    create(data: CreateProductRequest): Observable<ProductDto> {
        return this.http.post<ProductDto>(this.productsUrl, data);
    }

    update(id: string, data: UpdateProductRequest): Observable<ProductDto> {
        return this.http.put<ProductDto>(`${this.productsUrl}/${id}`, data);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.productsUrl}/${id}`);
    }
}
