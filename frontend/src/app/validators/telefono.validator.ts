import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

// saca espacios, guiones y parentesis: "+56 9 1111 2222" -> "+56911112222"
export function limpiarTelefono(telefono: string): string {
  return telefono.replace(/[\s\-()]/g, '');
}

// numero chileno: 9 digitos, con o sin +56 adelante (celular o fijo)
export function esTelefonoValido(telefono: string): boolean {
  return /^(\+?56)?\d{9}$/.test(limpiarTelefono(telefono));
}

export const telefonoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return esTelefonoValido(String(control.value)) ? null : { telefono: true };
};

@Directive({
  selector: '[appTelefono]',
  standalone: false,
  providers: [{ provide: NG_VALIDATORS, useExisting: TelefonoValidatorDirective, multi: true }],
})
export class TelefonoValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return telefonoValidator(control);
  }
}
