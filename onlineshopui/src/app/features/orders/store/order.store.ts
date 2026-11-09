import { Injector, computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
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
import { CreateOrderDto, OrderDto } from '../../../core/types/dtos/order.dto';
import { OrdersService } from '../services/orders.service';

// Keep the public state contract as an interface for store consumers.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface OrderState {
    orders: OrderDto[];
    selectedOrder: OrderDto | null;
    loading: boolean;
    error: string | null;
    listLoading: boolean;
    listError: string | null;
    detailLoading: boolean;
    detailError: string | null;
    creationLoading: boolean;
    creationError: string | null;
}

const initialOrderState: OrderState = {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
    listLoading: false,
    listError: null,
    detailLoading: false,
    detailError: null,
    creationLoading: false,
    creationError: null
};

type ReadOperation<T> = {
    result: ReplaySubject<T>;
};

type CreateOperation = {
    data: CreateOrderDto;
    result: ReplaySubject<OrderDto>;
};

export const OrderStore = signalStore(
    { providedIn: 'root' },
    withState<OrderState>(initialOrderState),
    withComputed(({ orders, selectedOrder }) => ({
        orderCount: computed(() => orders().length),
        ordersById: computed(() => new Map(orders().map(order => [order.id, order]))),
        hasSelectedOrder: computed(() => selectedOrder() !== null)
    })),
    withMethods(store => {
        const ordersService = inject(OrdersService);
        const injector = inject(Injector);

        const updateState = (changes: Partial<OrderState>): void => {
            patchState(store, state => {
                const nextState = { ...state, ...changes };
                return {
                    ...changes,
                    loading:
                        nextState.listLoading ||
                        nextState.detailLoading ||
                        nextState.creationLoading,
                    error:
                        nextState.creationError ??
                        nextState.detailError ??
                        nextState.listError
                };
            });
        };

        const loadAllEffect = rxMethod<ReadOperation<void>>(
            pipe(
                mergeMap(({ result }) => {
                    updateState({
                        listLoading: true,
                        listError: null
                    });

                    return ordersService.loadAll().pipe(
                        tap(orders => {
                            updateState({
                                orders,
                                listError: null
                            });
                            result.next();
                            result.complete();
                        }),
                        catchError(() => {
                            updateState({
                                listError: 'Failed to load orders'
                            });
                            result.next();
                            result.complete();
                            return of([]);
                        }),
                        finalize(() => updateState({ listLoading: false }))
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

                    return ordersService.loadById(id).pipe(
                        tap(order => {
                            updateState({
                                selectedOrder: order,
                                detailError: null
                            });
                            result.next();
                            result.complete();
                        }),
                        catchError(() => {
                            updateState({
                                detailError: 'Failed to load order',
                                selectedOrder: null
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

        const createEffect = rxMethod<CreateOperation>(
            pipe(
                mergeMap(({ data, result }) => {
                    updateState({
                        creationLoading: true,
                        creationError: null
                    });

                    return ordersService.create(data).pipe(
                        tap(createdOrder => {
                            updateState({
                                orders: [createdOrder, ...store.orders()],
                                creationError: null
                            });
                            result.next(createdOrder);
                            result.complete();
                        }),
                        catchError(error => {
                            updateState({
                                creationError: 'Failed to create order'
                            });
                            result.error(error);
                            return EMPTY;
                        }),
                        finalize(() => updateState({ creationLoading: false }))
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
            create(data: CreateOrderDto): Observable<OrderDto> {
                const result = new ReplaySubject<OrderDto>(1);
                createEffect({ data, result });
                return result.asObservable();
            },
            clearSelectedOrder(): void {
                updateState({ selectedOrder: null });
            }
        };
    })
);
