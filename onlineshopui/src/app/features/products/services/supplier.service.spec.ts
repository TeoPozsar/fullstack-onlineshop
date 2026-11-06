import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { take } from 'rxjs';
import { SupplierService } from './supplier.service';
import { EnvironmentConfig } from '../../../core/types/providers/environment-config';
import { MOCK_SUPPLIERS } from '../../../core/mocks/data/products.mock';
import { MOCK_ENVIRONMENT_CONFIG } from '../../../core/mocks/data/environment.mock';
import { TranslocoService } from '@jsverse/transloco';
import { vi } from 'vitest';
import { translocoTestingImports } from '../../../core/testing/transloco-testing';

describe('SupplierService', () => {
    let service: SupplierService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: translocoTestingImports,
            providers: [
                SupplierService,
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: EnvironmentConfig,
                    useValue: MOCK_ENVIRONMENT_CONFIG
                },
                {
                    provide: TranslocoService,
                    useValue: {
                        translate: vi.fn().mockReturnValue('Failed to load suppliers')
                    }
                }
            ]
        });

        service = TestBed.inject(SupplierService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should initialize with empty state', () => {
        expect(service.suppliers()).toEqual([]);
        expect(service.loading()).toBe(false);
        expect(service.error()).toBeNull();
    });

    it('should load suppliers successfully', () => {
        service.loadAll().pipe(take(1)).subscribe();

        const req = httpMock.expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/suppliers`);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_SUPPLIERS);

        expect(service.suppliers()).toEqual(MOCK_SUPPLIERS);
        expect(service.error()).toBeNull();
        expect(service.loading()).toBe(false);
    });

    it('should report an error when suppliers fail to load', () => {
        service.loadAll().pipe(take(1)).subscribe();

        const req = httpMock.expectOne(`${MOCK_ENVIRONMENT_CONFIG.apiUrl}/suppliers`);
        req.flush('Error', { status: 500, statusText: 'Server Error' });

        expect(service.suppliers()).toEqual([]);
        expect(service.error()).toBe('Failed to load suppliers');
        expect(service.loading()).toBe(false);
    });
});
