import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

// solo letras y espacios, sin numeros ni simbolos (las tildes y la ñ si valen)
export function esNombreValido(nombre: string): boolean {
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(nombre.trim());
}

export const nombreValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return esNombreValido(String(control.value)) ? null : { nombre: true };
};

// se usa en nombre y apellidos de cuentas y en el cliente de nueva venta
@Directive({
  selector: '[appNombre]',
  standalone: false,
  providers: [{ provide: NG_VALIDATORS, useExisting: NombreValidatorDirective, multi: true }],
})
export class NombreValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return nombreValidator(control);
  }
}
