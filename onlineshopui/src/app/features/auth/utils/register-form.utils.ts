import { FormControl, FormGroup, Validators } from '@angular/forms';

export function createRegisterForm(): FormGroup {
    return new FormGroup({
        email: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.email]
        }),
        firstName: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(1)]
        }),
        lastName: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(1)]
        }),
        password: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(4)]
        })
    });
}
