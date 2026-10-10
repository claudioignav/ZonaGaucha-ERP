import { Pipe, PipeTransform } from '@angular/core';
import { limpiarTelefono } from '../validators/telefono.validator';

// "+56911112222" o "911112222" -> "+56 9 1111 2222"
// si no tiene 9 digitos lo deja tal cual para no inventar nada
@Pipe({ name: 'telefono', standalone: false })
export class TelefonoPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '';
    const digitos = limpiarTelefono(valor).replace(/^\+?56/, '');
    if (!/^\d{9}$/.test(digitos)) return valor;
    return `+56 ${digitos[0]} ${digitos.slice(1, 5)} ${digitos.slice(5)}`;
  }
}
