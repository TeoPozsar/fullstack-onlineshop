import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { vi } from 'vitest';
import { rolesGuard } from './roles.guard';
import { AuthService } from '../services/auth.service';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';
import { UserRole } from '../../../core/types/enums/user-roles.enum';
import { MOCK_USERS } from '../../../core/mocks/data/users.mock';

describe('rolesGuard', () => {
    let authServiceMock: {
        loadProfileIfNeeded: ReturnType<typeof vi.fn>;
        hasRole: ReturnType<typeof vi.fn>;
    };
    let routerSpy: {
        createUrlTree: ReturnType<typeof vi.fn>;
    };
    let routeMock: Partial<ActivatedRouteSnapshot>;

    beforeEach(() => {
        authServiceMock = {
            loadProfileIfNeeded: vi.fn(),
            hasRole: vi.fn()
        };

        routerSpy = {
            createUrlTree: vi.fn()
        };

        routeMock = {
            data: {}
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    it('should allow activation when no roles are required', () => {
        // Prepare
        routeMock.data = {};
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));

        // Action
        const result = TestBed.runInInjectionContext(() =>
            rolesGuard(routeMock as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
        );

        // Verify
        expect(result).toBe(true);
        expect(authServiceMock.loadProfileIfNeeded).not.toHaveBeenCalled();
        expect(authServiceMock.hasRole).not.toHaveBeenCalled();
    });

    it('should allow activation when user has required role (single role)', () => {
        // Prepare
        routeMock.data = { roles: UserRole.ADMIN };
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authServiceMock.hasRole.mockReturnValue(true);

        // Action
        TestBed.runInInjectionContext(() => {
            const result$ = rolesGuard(
                routeMock as ActivatedRouteSnapshot,
                {} as RouterStateSnapshot
            );
            (typeof result$ === 'boolean'
                ? of(result$)
                : (result$ as Observable<boolean | UrlTree>)
            )
                .pipe(take(1))
                .subscribe((result: boolean | UrlTree) => {
                    // Verify
                    expect(result).toBe(true);
                    expect(authServiceMock.loadProfileIfNeeded).toHaveBeenCalled();
                    expect(authServiceMock.hasRole).toHaveBeenCalledWith(UserRole.ADMIN);
                    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
                });
        });
    });

    it('should allow activation when user has required role (array of roles)', () => {
        // Prepare
        routeMock.data = { roles: [UserRole.ADMIN, UserRole.CUSTOMER] };
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authServiceMock.hasRole.mockReturnValue(true);

        // Action
        TestBed.runInInjectionContext(() => {
            const result$ = rolesGuard(
                routeMock as ActivatedRouteSnapshot,
                {} as RouterStateSnapshot
            );
            (typeof result$ === 'boolean'
                ? of(result$)
                : (result$ as Observable<boolean | UrlTree>)
            )
                .pipe(take(1))
                .subscribe((result: boolean | UrlTree) => {
                    // Verify
                    expect(result).toBe(true);
                    expect(authServiceMock.loadProfileIfNeeded).toHaveBeenCalled();
                    expect(authServiceMock.hasRole).toHaveBeenCalledWith([
                        UserRole.ADMIN,
                        UserRole.CUSTOMER
                    ]);
                });
        });
    });

    it('should redirect to products when user does not have required role', () => {
        // Prepare
        routeMock.data = { roles: UserRole.ADMIN };
        const mockUrlTree = {} as UrlTree;
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[1]));
        authServiceMock.hasRole.mockReturnValue(false);
        routerSpy.createUrlTree.mockReturnValue(mockUrlTree);

        // Action
        TestBed.runInInjectionContext(() => {
            const result$ = rolesGuard(
                routeMock as ActivatedRouteSnapshot,
                {} as RouterStateSnapshot
            );
            (typeof result$ === 'boolean'
                ? of(result$)
                : (result$ as Observable<boolean | UrlTree>)
            )
                .pipe(take(1))
                .subscribe((result: boolean | UrlTree) => {
                    // Verify
                    expect(result).toBe(mockUrlTree);
                    expect(authServiceMock.loadProfileIfNeeded).toHaveBeenCalled();
                    expect(authServiceMock.hasRole).toHaveBeenCalledWith(UserRole.ADMIN);
                    expect(routerSpy.createUrlTree).toHaveBeenCalledWith([
                        '/',
                        AppNavRoutes.Products.root,
                        AppNavRoutes.Products.features.overview
                    ]);
                });
        });
    });

    it('should complete observable after first emission', () => {
        // Prepare
        routeMock.data = { roles: UserRole.CUSTOMER };
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[1]));
        authServiceMock.hasRole.mockReturnValue(true);
        let emissionCount = 0;

        // Action
        TestBed.runInInjectionContext(() => {
            const result$ = rolesGuard(
                routeMock as ActivatedRouteSnapshot,
                {} as RouterStateSnapshot
            );

            (typeof result$ === 'boolean'
                ? of(result$)
                : (result$ as Observable<boolean | UrlTree>)
            ).subscribe({
                next: () => {
                    emissionCount++;
                },
                complete: () => {
                    // Verify
                    expect(emissionCount).toBe(1);
                }
            });
        });
    });

    it('should call loadProfileIfNeeded when roles are required', () => {
        // Prepare
        routeMock.data = { roles: UserRole.CUSTOMER };
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[1]));
        authServiceMock.hasRole.mockReturnValue(true);

        // Action
        TestBed.runInInjectionContext(() => {
            const result$ = rolesGuard(
                routeMock as ActivatedRouteSnapshot,
                {} as RouterStateSnapshot
            );
            (typeof result$ === 'boolean'
                ? of(result$)
                : (result$ as Observable<boolean | UrlTree>)
            )
                .pipe(take(1))
                .subscribe(() => {
                    // Verify
                    expect(authServiceMock.loadProfileIfNeeded).toHaveBeenCalledTimes(1);
                });
        });
    });
});
