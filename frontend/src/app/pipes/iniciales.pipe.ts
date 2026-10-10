import { Pipe, PipeTransform } from '@angular/core';

// "Ana María Rojas" -> "AR" (primera letra del primer y del ultimo nombre), para el avatar del menu
@Pipe({ name: 'iniciales', standalone: false })
export class InicialesPipe implements PipeTransform {
  transform(nombre: string | null | undefined): string {
    const palabras = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
    if (palabras.length === 0) return '';
    const primera = palabras[0][0];
    const ultima = palabras.length > 1 ? palabras.at(-1)?.[0] ?? '' : '';
    return (primera + ultima).toUpperCase();
  }
}
