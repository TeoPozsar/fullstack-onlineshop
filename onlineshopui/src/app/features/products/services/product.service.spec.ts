import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProductService } from './product.service';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import { MOCK_ENVIRONMENT_CONFIG } from '../../../core/mocks/data/environment.mock';
import {
    MOCK_CATEGORIES,
    MOCK_PRODUCTS,
    MOCK_SUPPLIERS
} from '../../../core/mocks/data/products.mock';
import { CreateProductRequest, ProductDto } from '../../../core/types/dtos/product.dto';

describe('ProductService', () => {
    let service: ProductService;
    let httpMock: {
        get: ReturnType<typeof vi.fn>;
        post: ReturnType<typeof vi.fn>;
        put: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        httpMock = {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                ProductService,
                { provide: HttpClient, useValue: httpMock },
                {
                    provide: EnvironmentConfig,
                    useValue: MOCK_ENVIRONMENT_CONFIG
                }
            ]
        });

        service = TestBed.inject(ProductService);
    });

    it('should be created as a stateless API boundary', () => {
        expect(service).toBeTruthy();
    });

    it('should preserve product collection, detail, and category requests', () => {
        httpMock.get
            .mockReturnValueOnce(of(MOCK_PRODUCTS))
            .mockReturnValueOnce(of(MOCK_PRODUCTS[0]))
            .mockReturnValueOnce(of(MOCK_CATEGORIES));

        service.loadAll().subscribe(products => expect(products).toEqual(MOCK_PRODUCTS));
        service.loadById('prod-1').subscribe(product => expect(product).toEqual(MOCK_PRODUCTS[0]));
        service
            .loadCategories()
            .subscribe(categories => expect(categories).toEqual(MOCK_CATEGORIES));

        expect(httpMock.get).toHaveBeenNthCalledWith(
            1,
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/products`
        );
        expect(httpMock.get).toHaveBeenNthCalledWith(
            2,
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/products/prod-1`
        );
        expect(httpMock.get).toHaveBeenNthCalledWith(
            3,
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/products/categories`
        );
    });

    it('should preserve product mutation request formats and responses', () => {
        const data: CreateProductRequest = {
            name: 'New Product',
            description: 'Test product',
            price: 99.99,
            weight: 1.5,
            imageUrl: 'http://test.com/image.jpg',
            categoryId: MOCK_CATEGORIES[0].id,
            supplierId: MOCK_SUPPLIERS[0].id
        };
        const createdProduct: ProductDto = {
            id: 'prod-new',
            name: data.name,
            description: data.description,
            price: data.price,
            weight: data.weight,
            imageUrl: data.imageUrl,
            category: MOCK_CATEGORIES[0],
            supplier: MOCK_SUPPLIERS[0]
        };
        const updatedProduct = { ...createdProduct, name: 'Updated Product' };

        httpMock.post.mockReturnValue(of(createdProduct));
        httpMock.put.mockReturnValue(of(updatedProduct));
        httpMock.delete.mockReturnValue(of(void 0));

        service.create(data).subscribe(product => expect(product).toEqual(createdProduct));
        service
            .update('prod-new', { name: 'Updated Product', supplierId: data.supplierId })
            .subscribe(product => expect(product).toEqual(updatedProduct));
        service.delete('prod-new').subscribe();

        expect(httpMock.post).toHaveBeenCalledWith(
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/products`,
            data
        );
        expect(httpMock.put).toHaveBeenCalledWith(
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/products/prod-new`,
            { name: 'Updated Product', supplierId: data.supplierId }
        );
        expect(httpMock.delete).toHaveBeenCalledWith(
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/products/prod-new`
        );
    });
});
