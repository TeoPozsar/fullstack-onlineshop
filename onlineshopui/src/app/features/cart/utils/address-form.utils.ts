import { FormControl, FormGroup, Validators } from '@angular/forms';

export function createAddressForm(): FormGroup {
    return new FormGroup({
        country: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]
        }),
        city: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]
        }),
        county: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]
        }),
        streetAddress: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]
        })
    });
}
