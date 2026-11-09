import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { HasRoleDirective } from './has-role.directive';
import { AuthStore } from '../store/auth.store';
import { UserRole } from '../../../core/types/enums/user-roles.enum';
import { MOCK_USERS } from '../../../core/mocks/data/users.mock';

@Component({
    standalone: true,
    imports: [HasRoleDirective],
    template: `
        <div *appHasRole="requiredRole()" data-testid="protected-content">Protected Content</div>
    `
})
class TestHostComponent {
    requiredRole = signal<UserRole>(UserRole.ADMIN);
}

describe('HasRoleDirective', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let authStoreMock: {
        loadProfileIfNeeded: ReturnType<typeof vi.fn>;
        isAuthenticated: ReturnType<typeof vi.fn>;
        hasRole: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        authStoreMock = {
            loadProfileIfNeeded: vi.fn(),
            isAuthenticated: vi.fn(),
            hasRole: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [TestHostComponent, HasRoleDirective],
            providers: [{ provide: AuthStore, useValue: authStoreMock }]
        });
    });

    it('should create directive', () => {
        // Prepare
        authStoreMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authStoreMock.isAuthenticated.mockReturnValue(true);
        authStoreMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Verify
        expect(component).toBeTruthy();
    });

    it('should render content when user has required role', () => {
        // Prepare
        authStoreMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authStoreMock.isAuthenticated.mockReturnValue(true);
        authStoreMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        component.requiredRole.set(UserRole.ADMIN);
        fixture.detectChanges();

        // Verify
        const content = fixture.nativeElement.querySelector('[data-testid="protected-content"]');
        expect(content).toBeTruthy();
        expect(content?.textContent).toContain('Protected Content');
        expect(authStoreMock.hasRole).toHaveBeenCalledWith(UserRole.ADMIN);
    });

    it('should not render content when user does not have required role', () => {
        // Prepare
        authStoreMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[1]));
        authStoreMock.isAuthenticated.mockReturnValue(true);
        authStoreMock.hasRole.mockReturnValue(false);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        component.requiredRole.set(UserRole.ADMIN);
        fixture.detectChanges();

        // Verify
        const content = fixture.nativeElement.querySelector('[data-testid="protected-content"]');
        expect(content).toBeFalsy();
        expect(authStoreMock.hasRole).toHaveBeenCalledWith(UserRole.ADMIN);
    });

    it('should not render content when user is not authenticated', () => {
        // Prepare
        authStoreMock.loadProfileIfNeeded.mockReturnValue(of(null));
        authStoreMock.isAuthenticated.mockReturnValue(false);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        component.requiredRole.set(UserRole.ADMIN);
        fixture.detectChanges();

        // Verify
        const content = fixture.nativeElement.querySelector('[data-testid="protected-content"]');
        expect(content).toBeFalsy();
    });

    it('should clear view when currentUser is null', () => {
        // Prepare
        authStoreMock.loadProfileIfNeeded.mockReturnValue(of(null));

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Verify
        const content = fixture.nativeElement.querySelector('[data-testid="protected-content"]');
        expect(content).toBeFalsy();
    });

    it('should clear view when currentUser is undefined', () => {
        // Prepare
        authStoreMock.loadProfileIfNeeded.mockReturnValue(of(undefined));

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Verify
        const content = fixture.nativeElement.querySelector('[data-testid="protected-content"]');
        expect(content).toBeFalsy();
    });

    it('should work with CUSTOMER role', () => {
        // Prepare
        authStoreMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[1]));
        authStoreMock.isAuthenticated.mockReturnValue(true);
        authStoreMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        component.requiredRole.set(UserRole.CUSTOMER);
        fixture.detectChanges();

        // Verify
        const content = fixture.nativeElement.querySelector('[data-testid="protected-content"]');
        expect(content).toBeTruthy();
        expect(authStoreMock.hasRole).toHaveBeenCalledWith(UserRole.CUSTOMER);
    });

    it('should call loadProfileIfNeeded on init', () => {
        // Prepare
        authStoreMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authStoreMock.isAuthenticated.mockReturnValue(true);
        authStoreMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Verify
        expect(authStoreMock.loadProfileIfNeeded).toHaveBeenCalledTimes(1);
    });

    it('should check both isAuthenticated and hasRole', () => {
        // Prepare
        authStoreMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authStoreMock.isAuthenticated.mockReturnValue(true);
        authStoreMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        component.requiredRole.set(UserRole.ADMIN);
        fixture.detectChanges();

        // Verify
        expect(authStoreMock.isAuthenticated).toHaveBeenCalled();
        expect(authStoreMock.hasRole).toHaveBeenCalledWith(UserRole.ADMIN);
    });
});
