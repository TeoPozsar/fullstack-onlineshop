import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { HasRoleDirective } from './has-role.directive';
import { AuthService } from '../services/auth.service';
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
    let authServiceMock: {
        loadProfileIfNeeded: ReturnType<typeof vi.fn>;
        isAuthenticated: ReturnType<typeof vi.fn>;
        hasRole: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        authServiceMock = {
            loadProfileIfNeeded: vi.fn(),
            isAuthenticated: vi.fn(),
            hasRole: vi.fn()
        };

        TestBed.configureTestingModule({
            imports: [TestHostComponent, HasRoleDirective],
            providers: [{ provide: AuthService, useValue: authServiceMock }]
        });
    });

    it('should create directive', () => {
        // Prepare
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Verify
        expect(component).toBeTruthy();
    });

    it('should render content when user has required role', () => {
        // Prepare
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        component.requiredRole.set(UserRole.ADMIN);
        fixture.detectChanges();

        // Verify
        const content = fixture.nativeElement.querySelector('[data-testid="protected-content"]');
        expect(content).toBeTruthy();
        expect(content?.textContent).toContain('Protected Content');
        expect(authServiceMock.hasRole).toHaveBeenCalledWith(UserRole.ADMIN);
    });

    it('should not render content when user does not have required role', () => {
        // Prepare
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[1]));
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.hasRole.mockReturnValue(false);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        component.requiredRole.set(UserRole.ADMIN);
        fixture.detectChanges();

        // Verify
        const content = fixture.nativeElement.querySelector('[data-testid="protected-content"]');
        expect(content).toBeFalsy();
        expect(authServiceMock.hasRole).toHaveBeenCalledWith(UserRole.ADMIN);
    });

    it('should not render content when user is not authenticated', () => {
        // Prepare
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(null));
        authServiceMock.isAuthenticated.mockReturnValue(false);

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
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(null));

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
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(undefined));

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
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[1]));
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        component.requiredRole.set(UserRole.CUSTOMER);
        fixture.detectChanges();

        // Verify
        const content = fixture.nativeElement.querySelector('[data-testid="protected-content"]');
        expect(content).toBeTruthy();
        expect(authServiceMock.hasRole).toHaveBeenCalledWith(UserRole.CUSTOMER);
    });

    it('should call loadProfileIfNeeded on init', () => {
        // Prepare
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Verify
        expect(authServiceMock.loadProfileIfNeeded).toHaveBeenCalledTimes(1);
    });

    it('should check both isAuthenticated and hasRole', () => {
        // Prepare
        authServiceMock.loadProfileIfNeeded.mockReturnValue(of(MOCK_USERS[0]));
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.hasRole.mockReturnValue(true);

        // Action
        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        component.requiredRole.set(UserRole.ADMIN);
        fixture.detectChanges();

        // Verify
        expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
        expect(authServiceMock.hasRole).toHaveBeenCalledWith(UserRole.ADMIN);
    });
});
