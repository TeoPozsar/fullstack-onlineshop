import { InjectionToken } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

export type ValidationMessageFn = (errors: ValidationErrors) => string;

export type ValidationMessagesMap = Record<string, ValidationMessageFn>;

export const ValidationMessages = new InjectionToken<ValidationMessagesMap>('VALIDATION_MESSAGES');
