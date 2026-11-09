import { computed, inject, Injector, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signalStore, patchState, withComputed, withMethods, withState } from '@ngrx/signals';
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
    switchMap,
    tap
} from 'rxjs';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import {
    JwtPayloadDto,
    LoginCredentialsDto,
    RegisterRequestDto
} from '../../../core/types/dtos/auth.dto';
import { UserDto } from '../../../core/types/dtos/user.dto';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';
import { Router } from '@angular/router';

// Keep the public state contract as an interface for store consumers.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface AuthState {
    token: string | null;
    user: UserDto | null;
    profileLoaded: boolean;
    loading: boolean;
    error: unknown | null;
}

const ACCESS_TOKEN_STORAGE_KEY = 'access_token';

const readTokenFromStorage = (): string | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

const initialAuthState = (): AuthState => ({
    token: readTokenFromStorage(),
    user: null,
    profileLoaded: false,
    loading: false,
    error: null
});

type AuthOperation<TResult> = {
    result: ReplaySubject<TResult>;
};

type LoginOperation = AuthOperation<UserDto | null> & {
    payload: LoginCredentialsDto;
};

type RegisterOperation = AuthOperation<unknown> & {
    payload: RegisterRequestDto;
};

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState<AuthState>(initialAuthState),
    withComputed(({ token, user }) => ({
        isAuthenticated: computed(() => token() !== null),
        roles: computed<string[]>(() => {
            const currentUser = user();
            return currentUser?.role ? [currentUser.role] : [];
        })
    })),
    withMethods(store => {
        const httpClient = inject(HttpClient);
        const router = inject(Router);
        const environmentConfig = inject(EnvironmentConfig);
        const injector = inject(Injector);
        const profileUrl = `${environmentConfig.apiUrl}/auth/profile`;

        const persistToken = (accessToken: string): void => {
            patchState(store, {
                token: accessToken,
                user: null,
                profileLoaded: false
            });

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
            }
        };

        const clearToken = (): void => {
            patchState(store, {
                token: null,
                user: null,
                profileLoaded: false
            });

            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
            }
        };

        const profileEffect = rxMethod<AuthOperation<UserDto | null>>(
            pipe(
                mergeMap(({ result }) => {
                    patchState(store, { loading: true, error: null });

                    return httpClient.get<UserDto>(profileUrl).pipe(
                        tap(user => {
                            patchState(store, {
                                user,
                                profileLoaded: true,
                                error: null
                            });
                            result.next(user);
                            result.complete();
                        }),
                        catchError(error => {
                            patchState(store, {
                                user: null,
                                profileLoaded: false,
                                error
                            });
                            result.error(error);
                            return EMPTY;
                        }),
                        finalize(() => patchState(store, { loading: false }))
                    );
                })
            ),
            { injector }
        );

        const loginEffect = rxMethod<LoginOperation>(
            pipe(
                mergeMap(({ payload, result }) => {
                    patchState(store, { loading: true, error: null });

                    return httpClient
                        .post<JwtPayloadDto>(
                            `${environmentConfig.apiUrl}/auth/login`,
                            payload
                        )
                        .pipe(
                            tap(response => persistToken(response.access_token)),
                            switchMap(() => httpClient.get<UserDto>(profileUrl)),
                            tap(user => {
                                patchState(store, {
                                    user,
                                    profileLoaded: true,
                                    error: null
                                });
                                result.next(user);
                                result.complete();
                            }),
                            catchError(error => {
                                patchState(store, {
                                    user: null,
                                    profileLoaded: false,
                                    error
                                });
                                result.error(error);
                                return EMPTY;
                            }),
                            finalize(() => patchState(store, { loading: false }))
                        );
                })
            ),
            { injector }
        );

        const registerEffect = rxMethod<RegisterOperation>(
            pipe(
                mergeMap(({ payload, result }) => {
                    patchState(store, { loading: true, error: null });

                    const extendedPayload = {
                        ...payload,
                        roles: ['user']
                    };

                    return httpClient
                        .post<unknown>(
                            `${environmentConfig.apiUrl}/auth/register`,
                            extendedPayload
                        )
                        .pipe(
                            tap(response => {
                                router.navigate([
                                    '/',
                                    AppNavRoutes.Auth.root,
                                    AppNavRoutes.Auth.features.login
                                ]);
                                result.next(response);
                                result.complete();
                            }),
                            catchError(error => {
                                patchState(store, { error });
                                result.error(error);
                                return EMPTY;
                            }),
                            finalize(() => patchState(store, { loading: false }))
                        );
                })
            ),
            { injector }
        );

        return {
            login(payload: LoginCredentialsDto): Observable<UserDto | null> {
                const result = new ReplaySubject<UserDto | null>(1);
                loginEffect({ payload, result });
                return result.asObservable();
            },
            register(payload: RegisterRequestDto): Observable<unknown> {
                const result = new ReplaySubject<unknown>(1);
                registerEffect({ payload, result });
                return result.asObservable();
            },
            logout(): void {
                clearToken();
                patchState(store, { loading: false, error: null });
                router.navigate(['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.login]);
            },
            getToken(): string | null {
                return store.token();
            },
            getUser(): Signal<UserDto | null> {
                return store.user;
            },
            hasRole(required: string | string[]): boolean {
                const requiredRoles = Array.isArray(required) ? required : [required];

                if (!requiredRoles.length) {
                    return true;
                }

                return requiredRoles.every(role => store.roles().includes(role));
            },
            loadProfileIfNeeded(): Observable<UserDto | null> {
                if (!store.token()) {
                    return of(null);
                }

                if (store.profileLoaded()) {
                    return of(store.user());
                }

                const result = new ReplaySubject<UserDto | null>(1);
                profileEffect({ result });
                return result.asObservable();
            }
        };
    })
);
