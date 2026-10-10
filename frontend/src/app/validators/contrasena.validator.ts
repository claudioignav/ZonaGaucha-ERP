import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

export const LARGO_MINIMO_CONTRASENA = 6;

// que no venga vacia (ni solo espacios) y que tenga el largo minimo
export const contrasenaValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '');
  if (valor.trim() && valor.length >= LARGO_MINIMO_CONTRASENA) return null;
  return { contrasena: { minimo: LARGO_MINIMO_CONTRASENA } };
};

@Directive({
  selector: '[appContrasena]',
  standalone: false,
  providers: [{ provide: NG_VALIDATORS, useExisting: ContrasenaValidatorDirective, multi: true }],
})
export class ContrasenaValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return contrasenaValidator(control);
  }
}
