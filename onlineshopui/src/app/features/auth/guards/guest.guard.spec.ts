import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';
import { guestGuard } from './guest.guard';
import { AuthStore } from '../store/auth.store';
import { AppNavRoutes } from '../../../core/config/constants/navigation.constants';

describe('guestGuard', () => {
    let authStoreMock: {
        isAuthenticated: ReturnType<typeof vi.fn>;
    };
    let routerSpy: {
        createUrlTree: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        authStoreMock = {
            isAuthenticated: vi.fn()
        };

        routerSpy = {
            createUrlTree: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthStore, useValue: authStoreMock },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    it('should allow activation when user is not authenticated', () => {
        // Prepare
        authStoreMock.isAuthenticated.mockReturnValue(false);

        // Action
        const result = TestBed.runInInjectionContext(() =>
            guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
        );

        // Verify
        expect(result).toBe(true);
        expect(authStoreMock.isAuthenticated).toHaveBeenCalled();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('should redirect to products when user is authenticated', () => {
        // Prepare
        authStoreMock.isAuthenticated.mockReturnValue(true);
        const mockUrlTree = {} as UrlTree;
        routerSpy.createUrlTree.mockReturnValue(mockUrlTree);

        // Action
        const result = TestBed.runInInjectionContext(() =>
            guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
        );

        // Verify
        expect(result).toBe(mockUrlTree);
        expect(authStoreMock.isAuthenticated).toHaveBeenCalled();
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith([
            '/',
            AppNavRoutes.Products.root,
            AppNavRoutes.Products.features.overview
        ]);
    });

    it('should not inject router when user is not authenticated', () => {
        // Prepare
        authStoreMock.isAuthenticated.mockReturnValue(false);

        // Action
        const result = TestBed.runInInjectionContext(() =>
            guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
        );

        // Verify
        expect(result).toBe(true);
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });
});
