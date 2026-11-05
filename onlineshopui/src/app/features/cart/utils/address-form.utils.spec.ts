import { createAddressForm } from './address-form.utils';

describe('createAddressForm', () => {
    it('requires all address fields and rejects whitespace-only values', () => {
        const form = createAddressForm();

        expect(form.invalid).toBe(true);

        form.setValue({
            country: 'USA',
            city: ' ',
            county: 'King',
            streetAddress: '123 Pine Street'
        });

        expect(form.invalid).toBe(true);
        expect(form.controls['city'].hasError('pattern')).toBe(true);
    });

    it('accepts addresses within the backend field limits', () => {
        const form = createAddressForm();

        form.setValue({
            country: 'C'.repeat(100),
            city: 'S'.repeat(100),
            county: 'K'.repeat(100),
            streetAddress: 'A'.repeat(255)
        });

        expect(form.valid).toBe(true);
    });

    it('rejects address fields that exceed the backend field limits', () => {
        const form = createAddressForm();

        form.setValue({
            country: 'C'.repeat(101),
            city: 'Seattle',
            county: 'King',
            streetAddress: 'A'.repeat(256)
        });

        expect(form.controls['country'].hasError('maxlength')).toBe(true);
        expect(form.controls['streetAddress'].hasError('maxlength')).toBe(true);
    });
});
