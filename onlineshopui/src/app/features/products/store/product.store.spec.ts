import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ProductStore } from './product.store';
import { ProductService } from '../services/product.service';
import {
    MOCK_CATEGORIES,
    MOCK_PRODUCTS,
    MOCK_SUPPLIERS
} from '../../../core/mocks/data/products.mock';

describe('ProductStore', () => {
    let store: InstanceType<typeof ProductStore>;
    let productServiceMock: {
        loadAll: ReturnType<typeof vi.fn>;
        loadById: ReturnType<typeof vi.fn>;
        loadCategories: ReturnType<typeof vi.fn>;
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        productServiceMock = {
            loadAll: vi.fn(),
            loadById: vi.fn(),
            loadCategories: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [ProductStore, { provide: ProductService, useValue: productServiceMock }]
        });

        store = TestBed.inject(ProductStore);
    });

    it('should initialize explicit product state and computed values', () => {
        expect(store.products()).toEqual([]);
        expect(store.selectedProduct()).toBeNull();
        expect(store.categories()).toEqual([]);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        expect(store.productCount()).toBe(0);
        expect(store.categoryCount()).toBe(0);
        expect(store.hasSelectedProduct()).toBe(false);
    });

    it('should load products and expose collection status', () => {
        const productsResponse = new Subject<typeof MOCK_PRODUCTS>();
        productServiceMock.loadAll.mockReturnValue(productsResponse);

        store.loadAll().subscribe();

        expect(store.collectionLoading()).toBe(true);
        expect(store.loading()).toBe(true);

        productsResponse.next(MOCK_PRODUCTS);
        productsResponse.complete();

        expect(store.products()).toEqual(MOCK_PRODUCTS);
        expect(store.collectionLoading()).toBe(false);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
        expect(store.productsById().get(MOCK_PRODUCTS[0].id)).toEqual(MOCK_PRODUCTS[0]);
    });

    it('should preserve products and return a success-shaped fallback when collection loading fails', () => {
        productServiceMock.loadAll.mockReturnValue(throwError(() => new Error('Failed')));

        store.loadAll().subscribe();

        expect(store.products()).toEqual([]);
        expect(store.collectionError()).toBe('Failed to load products');
        expect(store.error()).toBe('Failed to load products');
        expect(store.collectionLoading()).toBe(false);
    });

    it('should load and select a product, clearing selection on failure', () => {
        productServiceMock.loadById
            .mockReturnValueOnce(of(MOCK_PRODUCTS[0]))
            .mockReturnValueOnce(throwError(() => new Error('Not found')));

        store.loadById('prod-1').subscribe();
        expect(store.selectedProduct()).toEqual(MOCK_PRODUCTS[0]);
        expect(store.hasSelectedProduct()).toBe(true);
        expect(store.detailLoading()).toBe(false);

        store.loadById('missing').subscribe();

        expect(store.selectedProduct()).toBeNull();
        expect(store.detailError()).toBe('Failed to load product');
        expect(store.detailLoading()).toBe(false);
    });

    it('should track product and category loading independently', () => {
        const productsResponse = new Subject<typeof MOCK_PRODUCTS>();
        const categoriesResponse = new Subject<typeof MOCK_CATEGORIES>();
        productServiceMock.loadAll.mockReturnValue(productsResponse);
        productServiceMock.loadCategories.mockReturnValue(categoriesResponse);

        store.loadAll().subscribe();
        store.loadCategories().subscribe();

        expect(store.collectionLoading()).toBe(true);
        expect(store.categoryLoading()).toBe(true);

        productsResponse.next(MOCK_PRODUCTS);
        productsResponse.complete();

        expect(store.collectionLoading()).toBe(false);
        expect(store.categoryLoading()).toBe(true);
        expect(store.loading()).toBe(true);

        categoriesResponse.next(MOCK_CATEGORIES);
        categoriesResponse.complete();

        expect(store.categories()).toEqual(MOCK_CATEGORIES);
        expect(store.categoryLoading()).toBe(false);
        expect(store.loading()).toBe(false);
    });

    it('should apply create, update, and delete mutations to store state', () => {
        const createdProduct = {
            ...MOCK_PRODUCTS[0],
            id: 'prod-new',
            name: 'New Product'
        };
        const updatedProduct = { ...createdProduct, name: 'Updated Product' };

        productServiceMock.loadAll.mockReturnValue(of([MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]]));
        productServiceMock.create.mockReturnValue(of(createdProduct));
        productServiceMock.update.mockReturnValue(of(updatedProduct));
        productServiceMock.loadById.mockReturnValue(of(updatedProduct));
        productServiceMock.delete.mockReturnValue(of(void 0));

        store.loadAll().subscribe();
        store
            .create({
                name: 'New Product',
                description: createdProduct.description,
                price: createdProduct.price,
                weight: createdProduct.weight,
                imageUrl: createdProduct.imageUrl,
                categoryId: MOCK_CATEGORIES[0].id,
                supplierId: MOCK_SUPPLIERS[0].id
            })
            .subscribe();
        expect(store.products()).toContain(createdProduct);

        store
            .update('prod-new', {
                name: 'Updated Product',
                supplierId: MOCK_SUPPLIERS[0].id
            })
            .subscribe();
        expect(store.products().find(product => product.id === 'prod-new')).toEqual(updatedProduct);

        store.loadById('prod-new').subscribe();
        store.delete('prod-new').subscribe();

        expect(store.products().some(product => product.id === 'prod-new')).toBe(false);
        expect(store.selectedProduct()).toBeNull();
    });

    it('should propagate mutation errors while recording mutation state', () => {
        let receivedError: unknown;
        const error = new Error('Rejected');
        productServiceMock.create.mockReturnValue(throwError(() => error));

        store
            .create({
                name: 'New Product',
                description: 'Description',
                price: 1,
                weight: 1,
                imageUrl: 'product.jpg',
                categoryId: MOCK_CATEGORIES[0].id,
                supplierId: MOCK_SUPPLIERS[0].id
            })
            .subscribe({ error: received => (receivedError = received) });

        expect(receivedError).toBe(error);
        expect(store.mutationError()).toBe('Failed to create product');
        expect(store.mutationLoading()).toBe(false);
        expect(store.loading()).toBe(false);
    });

    it('should clear the selected product explicitly', () => {
        productServiceMock.loadById.mockReturnValue(of(MOCK_PRODUCTS[0]));
        store.loadById('prod-1').subscribe();

        store.clearSelectedProduct();

        expect(store.selectedProduct()).toBeNull();
        expect(store.hasSelectedProduct()).toBe(false);
    });
});
