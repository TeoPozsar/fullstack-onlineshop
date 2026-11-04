import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import {
    JwtPayloadDto,
    LoginCredentialsDto,
    RegisterRequestDto
} from '../../../core/types/dtos/auth.dto';
import { UserDto } from '../../../core/types/dtos/user.dto';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly httpClient = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly environmentConfig = inject(EnvironmentConfig);
    private readonly ACCESS_TOKEN_STORAGE_KEY = 'access_token';

    private readonly token = signal<string | null>(this.readTokenFromStorage());
    private readonly user = signal<UserDto | null>(null);
    private readonly profileLoaded = signal(false);

    readonly isAuthenticated = computed(() => this.token() !== null);
    readonly roles = computed<string[]>(() => {
        const user = this.user();
        if (!user) {
            return [];
        }

        return user.role ? [user.role] : [];
    });

    login(payload: LoginCredentialsDto) {
        return this.httpClient
            .post<JwtPayloadDto>(`${this.environmentConfig.apiUrl}/auth/login`, payload)
            .pipe(
                tap(response => {
                    this.persistToken(response.access_token);
                }),
                switchMap(() => this.fetchCurrentUser())
            );
    }

    register(payload: RegisterRequestDto) {
        const extendedPayload = {
            ...payload,
            roles: ['user']
        };

        return this.httpClient
            .post(`${this.environmentConfig.apiUrl}/auth/register`, extendedPayload)
            .pipe(
                tap(() => {
                    this.router.navigate([
                        '/',
                        AppNavRoutes.Auth.root,
                        AppNavRoutes.Auth.features.login
                    ]);
                })
            );
    }

    logout() {
        this.clearToken();
        this.user.set(null);
        this.profileLoaded.set(false);
        this.router.navigate(['/', AppNavRoutes.Auth.root, AppNavRoutes.Auth.features.login]);
    }

    getToken(): string | null {
        return this.token();
    }

    getUser(): Signal<UserDto | null> {
        return this.user.asReadonly();
    }

    hasRole(required: string | string[]): boolean {
        const requiredRoles = Array.isArray(required) ? required : [required];
        const userRoles = this.roles();

        if (!requiredRoles.length) {
            return true;
        }

        return requiredRoles.every(role => userRoles.includes(role));
    }

    loadProfileIfNeeded(): Observable<UserDto | null> {
        const hasToken = !!this.token();

        if (!hasToken) {
            return of(null);
        }

        if (this.profileLoaded()) {
            return of(this.user());
        }

        return this.fetchCurrentUser();
    }

    private readTokenFromStorage(): string | null {
        if (typeof window === 'undefined') {
            return null;
        }

        return window.localStorage.getItem(this.ACCESS_TOKEN_STORAGE_KEY);
    }

    private persistToken(accessToken: string) {
        this.token.set(accessToken);

        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(this.ACCESS_TOKEN_STORAGE_KEY, accessToken);
    }

    private clearToken() {
        this.token.set(null);

        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.removeItem(this.ACCESS_TOKEN_STORAGE_KEY);
    }

    private fetchCurrentUser() {
        return this.httpClient.get<UserDto>(`${this.environmentConfig.apiUrl}/auth/profile`).pipe(
            tap(user => {
                this.user.set(user);
                this.profileLoaded.set(true);
            }),
            map(() => this.user())
        );
    }
}
