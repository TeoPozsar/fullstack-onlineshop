import { HttpClient } from '@angular/common/http';
import { computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize, catchError, of, map } from 'rxjs';
import { SupplierDto } from '../../../core/types/dtos/product.dto';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private readonly http = inject(HttpClient);
    private readonly environmentConfig = inject(EnvironmentConfig);
    private readonly translocoService = inject(TranslocoService);
    private readonly languageChanges = toSignal(
        this.translocoService.langChanges$ ?? of('en'),
        { initialValue: 'en' }
    );
    private readonly suppliersUrl = `${this.environmentConfig.apiUrl}/suppliers`;

    private readonly _suppliers = signal<SupplierDto[]>([]);
    private readonly _loading = signal(false);
    private readonly _errorKey = signal<string | null>(null);

    readonly suppliers = this._suppliers.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly errorKey = this._errorKey.asReadonly();
    readonly error = computed(() => {
        this.languageChanges();
        const key = this._errorKey();
        return key ? this.translocoService.translate(key) : null;
    });

    loadAll(): Observable<void> {
        this._loading.set(true);
        this._errorKey.set(null);

        return this.http.get<SupplierDto[]>(this.suppliersUrl).pipe(
            tap(suppliers => this._suppliers.set(suppliers)),
            tap(() => this._errorKey.set(null)),
            catchError(() => {
                this._errorKey.set('products.errors.suppliers');
                return of([]);
            }),
            finalize(() => this._loading.set(false)),
            map(() => undefined)
        );
    }
}
