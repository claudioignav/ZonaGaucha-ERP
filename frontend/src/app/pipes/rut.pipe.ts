import { Pipe, PipeTransform } from '@angular/core';
import { normalizarRut } from '../validators/rut.validator';

// en la bd queda "12345678-5" y en pantalla se ve "12.345.678-5"
@Pipe({ name: 'rut', standalone: false })
export class RutPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '';
    const rut = normalizarRut(valor);
    if (!rut) return valor;

    const [cuerpo, dv] = rut.split('-');
    return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
  }
}
