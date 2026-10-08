import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

// validacion simple: que tenga una @ y un punto
export function esCorreoValido(correo: string): boolean {
  return correo.includes('@') && correo.includes('.');
}

export const correoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return esCorreoValido(String(control.value)) ? null : { correo: true };
};

@Directive({
  selector: '[appCorreo]',
  standalone: false,
  providers: [{ provide: NG_VALIDATORS, useExisting: CorreoValidatorDirective, multi: true }],
})
export class CorreoValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return correoValidator(control);
  }
}
