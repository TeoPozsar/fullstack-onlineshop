import { Injector, computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
    EMPTY,
    Observable,
    ReplaySubject,
    catchError,
    finalize,
    mergeMap,
    of,
    pipe,
    tap
} from 'rxjs';
import {
    CreateProductRequest,
    ProductCategoryDto,
    ProductDto,
    UpdateProductRequest
} from '../../../core/types/dtos/product.dto';
import { ProductService } from '../services/product.service';

// Keep the public state contract as an interface for store consumers.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface ProductState {
    products: ProductDto[];
    selectedProduct: ProductDto | null;
    categories: ProductCategoryDto[];
    loading: boolean;
    error: string | null;
    collectionLoading: boolean;
    collectionError: string | null;
    detailLoading: boolean;
    detailError: string | null;
    categoryLoading: boolean;
    categoryError: string | null;
    mutationLoading: boolean;
    mutationError: string | null;
}

const initialProductState: ProductState = {
    products: [],
    selectedProduct: null,
    categories: [],
    loading: false,
    error: null,
    collectionLoading: false,
    collectionError: null,
    detailLoading: false,
    detailError: null,
    categoryLoading: false,
    categoryError: null,
    mutationLoading: false,
    mutationError: null
};

type ReadOperation<T> = {
    result: ReplaySubject<T>;
};

type ProductOperation<TData, TResult> = {
    result: ReplaySubject<TResult>;
    data: TData;
};

export const ProductStore = signalStore(
    { providedIn: 'root' },
    withState<ProductState>(initialProductState),
    withComputed(({ products, selectedProduct, categories }) => ({
        productCount: computed(() => products().length),
        categoryCount: computed(() => categories().length),
        productsById: computed(() => new Map(products().map(product => [product.id, product]))),
        hasSelectedProduct: computed(() => selectedProduct() !== null)
    })),
    withMethods(store => {
        const productService = inject(ProductService);
        const injector = inject(Injector);

        const updateState = (changes: Partial<ProductState>): void => {
            patchState(store, state => {
                const nextState = { ...state, ...changes };
                return {
                    ...changes,
                    loading:
                        nextState.collectionLoading ||
                        nextState.detailLoading ||
                        nextState.categoryLoading ||
                        nextState.mutationLoading,
                    error:
                        nextState.mutationError ??
                        nextState.detailError ??
                        nextState.categoryError ??
                        nextState.collectionError
                };
            });
        };

        const loadAllEffect = rxMethod<ReadOperation<void>>(
            pipe(
                mergeMap(({ result }) => {
                    updateState({
                        collectionLoading: true,
                        collectionError: null
                    });

                    return productService.loadAll().pipe(
                        tap(products => {
                            updateState({
                                products,
                                collectionError: null
                            });
                            result.next();
                            result.complete();
                        }),
                        catchError(() => {
                            updateState({
                                collectionError: 'Failed to load products'
                            });
                            result.next();
                            result.complete();
                            return of([]);
                        }),
                        finalize(() => updateState({ collectionLoading: false }))
                    );
                })
            ),
            { injector }
        );

        const loadByIdEffect = rxMethod<{ id: string; result: ReplaySubject<void> }>(
            pipe(
                mergeMap(({ id, result }) => {
                    updateState({
                        detailLoading: true,
                        detailError: null
                    });

                    return productService.loadById(id).pipe(
                        tap(product => {
                            updateState({
                                selectedProduct: product,
                                detailError: null
                            });
                            result.next();
                            result.complete();
                        }),
                        catchError(() => {
                            updateState({
                                detailError: 'Failed to load product',
                                selectedProduct: null
                            });
                            result.next();
                            result.complete();
                            return of(null);
                        }),
                        finalize(() => updateState({ detailLoading: false }))
                    );
                })
            ),
            { injector }
        );

        const loadCategoriesEffect = rxMethod<ReadOperation<void>>(
            pipe(
                mergeMap(({ result }) => {
                    updateState({
                        categoryLoading: true,
                        categoryError: null
                    });

                    return productService.loadCategories().pipe(
                        tap(categories => {
                            updateState({
                                categories,
                                categoryError: null
                            });
                            result.next();
                            result.complete();
                        }),
                        catchError(() => {
                            updateState({
                                categoryError: 'Failed to load categories'
                            });
                            result.next();
                            result.complete();
                            return of([]);
                        }),
                        finalize(() => updateState({ categoryLoading: false }))
                    );
                })
            ),
            { injector }
        );

        const createEffect = rxMethod<ProductOperation<CreateProductRequest, ProductDto>>(
            pipe(
                mergeMap(({ data, result }) => {
                    updateState({
                        mutationLoading: true,
                        mutationError: null
                    });

                    return productService.create(data).pipe(
                        tap(newProduct => {
                            updateState({
                                products: [...store.products(), newProduct],
                                mutationError: null
                            });
                            result.next(newProduct);
                            result.complete();
                        }),
                        catchError(error => {
                            updateState({
                                mutationError: 'Failed to create product'
                            });
                            result.error(error);
                            return EMPTY;
                        }),
                        finalize(() => updateState({ mutationLoading: false }))
                    );
                })
            ),
            { injector }
        );

        const updateEffect = rxMethod<{
            id: string;
            data: UpdateProductRequest;
            result: ReplaySubject<ProductDto>;
        }>(
            pipe(
                mergeMap(({ id, data, result }) => {
                    updateState({
                        mutationLoading: true,
                        mutationError: null
                    });

                    return productService.update(id, data).pipe(
                        tap(updatedProduct => {
                            updateState({
                                products: store
                                    .products()
                                    .map(product => (product.id === id ? updatedProduct : product)),
                                selectedProduct:
                                    store.selectedProduct()?.id === id
                                        ? updatedProduct
                                        : store.selectedProduct(),
                                mutationError: null
                            });
                            result.next(updatedProduct);
                            result.complete();
                        }),
                        catchError(error => {
                            updateState({
                                mutationError: 'Failed to update product'
                            });
                            result.error(error);
                            return EMPTY;
                        }),
                        finalize(() => updateState({ mutationLoading: false }))
                    );
                })
            ),
            { injector }
        );

        const deleteEffect = rxMethod<{ id: string; result: ReplaySubject<void> }>(
            pipe(
                mergeMap(({ id, result }) => {
                    updateState({
                        mutationLoading: true,
                        mutationError: null
                    });

                    return productService.delete(id).pipe(
                        tap(() => {
                            updateState({
                                products: store.products().filter(product => product.id !== id),
                                selectedProduct:
                                    store.selectedProduct()?.id === id
                                        ? null
                                        : store.selectedProduct(),
                                mutationError: null
                            });
                            result.next();
                            result.complete();
                        }),
                        catchError(error => {
                            updateState({
                                mutationError: 'Failed to delete product'
                            });
                            result.error(error);
                            return EMPTY;
                        }),
                        finalize(() => updateState({ mutationLoading: false }))
                    );
                })
            ),
            { injector }
        );

        return {
            loadAll(): Observable<void> {
                const result = new ReplaySubject<void>(1);
                loadAllEffect({ result });
                return result.asObservable();
            },
            loadById(id: string): Observable<void> {
                const result = new ReplaySubject<void>(1);
                loadByIdEffect({ id, result });
                return result.asObservable();
            },
            loadCategories(): Observable<void> {
                const result = new ReplaySubject<void>(1);
                loadCategoriesEffect({ result });
                return result.asObservable();
            },
            create(data: CreateProductRequest): Observable<ProductDto> {
                const result = new ReplaySubject<ProductDto>(1);
                createEffect({ data, result });
                return result.asObservable();
            },
            update(id: string, data: UpdateProductRequest): Observable<ProductDto> {
                const result = new ReplaySubject<ProductDto>(1);
                updateEffect({ id, data, result });
                return result.asObservable();
            },
            delete(id: string): Observable<void> {
                const result = new ReplaySubject<void>(1);
                deleteEffect({ id, result });
                return result.asObservable();
            },
            clearSelectedProduct(): void {
                updateState({ selectedProduct: null });
            }
        };
    })
);
