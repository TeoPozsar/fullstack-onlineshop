import { FormControl, FormGroup, Validators } from '@angular/forms';

export function createLoginForm(): FormGroup {
    return new FormGroup({
        email: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.email]
        }),
        password: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(4)]
        })
    });
}
