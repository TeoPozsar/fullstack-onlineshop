import {
    DestroyRef,
    Directive,
    inject,
    input,
    OnInit,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserRole } from '../../../core/types/enums/user-roles.enum';

@Directive({
    standalone: true,
    selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
    guardRole = input.required<UserRole>({ alias: 'appHasRole' });
    private readonly authStore = inject(AuthStore);
    private readonly templateRef = inject(TemplateRef<unknown>);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit() {
        this.authStore
            .loadProfileIfNeeded()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(currentUser => {
                if (!currentUser) {
                    this.viewContainer.clear();
                    return;
                }
                const hasAccess =
                    this.authStore.isAuthenticated() && this.authStore.hasRole(this.guardRole());
                if (hasAccess) {
                    this.viewContainer.createEmbeddedView(this.templateRef);
                } else {
                    this.viewContainer.clear();
                }
            });
    }
}
