import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

export function limpiarRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

// modulo 11, igual que en el back
export function calcularDigitoVerificador(cuerpo: string): string {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

// deja el rut como se guarda en la bd: 12345678-5 (sin puntos, con guion y K mayuscula).
// se puede escribir con o sin puntos/guion y si no viene el digito verificador se calcula.
// devuelve null si el rut no sirve
export function normalizarRut(rut: string): string | null {
  const limpio = limpiarRut(rut);
  let cuerpo = limpio;
  let dv: string | undefined;

  // trae dv si tiene guion, termina en K o tiene 9 caracteres.
  // con 8 numeros sin guion es ambiguo: si cuadra como 7 + dv se toma asi, si no se asume que falta el dv
  const cuadraComoSieteMasDv = limpio.length === 8 && calcularDigitoVerificador(limpio.slice(0, 7)) === limpio[7];
  if (rut.includes('-') || limpio.endsWith('K') || limpio.length === 9 || cuadraComoSieteMasDv) {
    cuerpo = limpio.slice(0, -1);
    dv = limpio.slice(-1);
  }

  if (!/^\d{7,8}$/.test(cuerpo)) return null;
  const dvCorrecto = calcularDigitoVerificador(cuerpo);
  if (dv !== undefined && dv !== dvCorrecto) return null;
  return `${cuerpo}-${dvCorrecto}`;
}

export const rutValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return normalizarRut(String(control.value)) ? null : { rut: true };
};

@Directive({
  selector: '[appRut]',
  standalone: false,
  providers: [{ provide: NG_VALIDATORS, useExisting: RutValidatorDirective, multi: true }],
})
export class RutValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return rutValidator(control);
  }
}
