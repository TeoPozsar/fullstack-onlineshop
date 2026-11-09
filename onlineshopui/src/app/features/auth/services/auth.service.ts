import { inject, Injectable, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginCredentialsDto, RegisterRequestDto } from '../../../core/types/dtos/auth.dto';
import { UserDto } from '../../../core/types/dtos/user.dto';
import { AuthStore } from '../store/auth.store';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly authStore = inject(AuthStore);

    readonly isAuthenticated = this.authStore.isAuthenticated;
    readonly roles = this.authStore.roles;

    login(payload: LoginCredentialsDto): Observable<UserDto | null> {
        return this.authStore.login(payload);
    }

    register(payload: RegisterRequestDto): Observable<unknown> {
        return this.authStore.register(payload);
    }

    logout(): void {
        this.authStore.logout();
    }

    getToken(): string | null {
        return this.authStore.getToken();
    }

    getUser(): Signal<UserDto | null> {
        return this.authStore.getUser();
    }

    hasRole(required: string | string[]): boolean {
        return this.authStore.hasRole(required);
    }

    loadProfileIfNeeded(): Observable<UserDto | null> {
        return this.authStore.loadProfileIfNeeded();
    }
}
