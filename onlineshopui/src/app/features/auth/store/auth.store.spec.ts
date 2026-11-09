import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { vi } from 'vitest';
import { MOCK_ENVIRONMENT_CONFIG } from '../../../core/mocks/data/environment.mock';
import {
    MOCK_JWT_TOKEN,
    MOCK_LOGIN_CREDENTIALS,
    MOCK_REGISTER_REQUEST
} from '../../../core/mocks/data/auth.mock';
import { MOCK_USERS } from '../../../core/mocks/data/users.mock';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
    let store: InstanceType<typeof AuthStore>;
    let httpMock: HttpTestingController;
    let routerMock: { navigate: ReturnType<typeof vi.fn> };
    let localStorageMock: Record<string, string>;

    beforeEach(() => {
        localStorageMock = {};
        routerMock = { navigate: vi.fn() };

        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
            (key: string) => localStorageMock[key] ?? null
        );
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
            (key: string, value: string) => {
                localStorageMock[key] = value;
            }
        );
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
            delete localStorageMock[key];
        });

        TestBed.configureTestingModule({
            providers: [
                AuthStore,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Router, useValue: routerMock },
                { provide: EnvironmentConfig, useValue: MOCK_ENVIRONMENT_CONFIG }
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        store = TestBed.inject(AuthStore);
    });

    afterEach(() => {
        httpMock.verify();
        vi.restoreAllMocks();
    });

    it('should initialize with explicit unauthenticated state', () => {
        expect(store.token()).toBeNull();
        expect(store.user()).toBeNull();
        expect(store.isAuthenticated()).toBe(false);
        expect(store.roles()).toEqual([]);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
    });

    it('should persist the token and hydrate the profile after a successful login', () => {
        let receivedUser = null;

        store
            .login(MOCK_LOGIN_CREDENTIALS)
            .pipe(take(1))
            .subscribe(user => (receivedUser = user));

        const loginRequest = httpMock.expectOne(
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/login`
        );
        expect(loginRequest.request.body).toEqual(MOCK_LOGIN_CREDENTIALS);
        loginRequest.flush({ access_token: MOCK_JWT_TOKEN });

        const profileRequest = httpMock.expectOne(
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/profile`
        );
        profileRequest.flush(MOCK_USERS[1]);

        expect(receivedUser).toEqual(MOCK_USERS[1]);
        expect(store.token()).toBe(MOCK_JWT_TOKEN);
        expect(localStorageMock['access_token']).toBe(MOCK_JWT_TOKEN);
        expect(store.user()).toEqual(MOCK_USERS[1]);
        expect(store.isAuthenticated()).toBe(true);
        expect(store.roles()).toEqual(['CUSTOMER']);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
    });

    it('should record login failures, propagate the error, and finish loading', () => {
        const loginError = new Error('Unauthorized');
        let receivedError: unknown;

        store
            .login(MOCK_LOGIN_CREDENTIALS)
            .pipe(take(1))
            .subscribe({ error: error => (receivedError = error) });

        const loginRequest = httpMock.expectOne(
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/login`
        );
        loginRequest.flush(loginError, { status: 401, statusText: 'Unauthorized' });

        expect(receivedError).toBeTruthy();
        expect(store.token()).toBeNull();
        expect(store.user()).toBeNull();
        expect(store.isAuthenticated()).toBe(false);
        expect(store.error()).toBeTruthy();
        expect(store.loading()).toBe(false);
    });

    it('should restore a persisted token synchronously and load the profile once', () => {
        localStorageMock['access_token'] = MOCK_JWT_TOKEN;
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                AuthStore,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Router, useValue: routerMock },
                { provide: EnvironmentConfig, useValue: MOCK_ENVIRONMENT_CONFIG }
            ]
        });

        const restoredStore = TestBed.inject(AuthStore);
        const restoredHttpMock = TestBed.inject(HttpTestingController);
        let receivedUser = null;

        expect(restoredStore.getToken()).toBe(MOCK_JWT_TOKEN);
        expect(restoredStore.isAuthenticated()).toBe(true);

        restoredStore
            .loadProfileIfNeeded()
            .pipe(take(1))
            .subscribe(user => (receivedUser = user));

        const profileRequest = restoredHttpMock.expectOne(
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/profile`
        );
        profileRequest.flush(MOCK_USERS[1]);

        restoredStore.loadProfileIfNeeded().pipe(take(1)).subscribe();

        expect(receivedUser).toEqual(MOCK_USERS[1]);
        expect(restoredStore.user()).toEqual(MOCK_USERS[1]);
        expect(restoredStore.profileLoaded()).toBe(true);
        restoredHttpMock.expectNone(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/profile`);
    });

    it('should record profile restoration failures without exposing a user', () => {
        localStorageMock['access_token'] = MOCK_JWT_TOKEN;
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [
                AuthStore,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: Router, useValue: routerMock },
                { provide: EnvironmentConfig, useValue: MOCK_ENVIRONMENT_CONFIG }
            ]
        });

        const restoredStore = TestBed.inject(AuthStore);
        const restoredHttpMock = TestBed.inject(HttpTestingController);
        let receivedError: unknown;

        restoredStore.loadProfileIfNeeded().subscribe({
            error: error => (receivedError = error)
        });

        restoredHttpMock
            .expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/profile`)
            .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(receivedError).toBeTruthy();
        expect(restoredStore.user()).toBeNull();
        expect(restoredStore.error()).toBeTruthy();
        expect(restoredStore.loading()).toBe(false);
    });

    it('should clear token, profile, storage, and navigate on logout', () => {
        store
            .login(MOCK_LOGIN_CREDENTIALS)
            .pipe(take(1))
            .subscribe();

        httpMock
            .expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/login`)
            .flush({ access_token: MOCK_JWT_TOKEN });
        httpMock
            .expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/profile`)
            .flush(MOCK_USERS[1]);

        store.logout();

        expect(store.getToken()).toBeNull();
        expect(store.user()).toBeNull();
        expect(store.isAuthenticated()).toBe(false);
        expect(store.roles()).toEqual([]);
        expect(localStorageMock['access_token']).toBeUndefined();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/', 'auth', 'login']);
    });

    it('should preserve registration payload and navigation behavior', () => {
        store.register(MOCK_REGISTER_REQUEST).pipe(take(1)).subscribe();

        const request = httpMock.expectOne(
            `${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/register`
        );
        expect(request.request.body).toEqual({
            ...MOCK_REGISTER_REQUEST,
            roles: ['user']
        });
        request.flush({});

        expect(routerMock.navigate).toHaveBeenCalledWith(['/', 'auth', 'login']);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
    });

    it('should propagate registration failures and finish loading', () => {
        let receivedError: unknown;

        store.register(MOCK_REGISTER_REQUEST).subscribe({
            error: error => (receivedError = error)
        });

        httpMock
            .expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/auth/register`)
            .flush('Conflict', { status: 409, statusText: 'Conflict' });

        expect(receivedError).toBeTruthy();
        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(store.error()).toBeTruthy();
        expect(store.loading()).toBe(false);
    });
});
