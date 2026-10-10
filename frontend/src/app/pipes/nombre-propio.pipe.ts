import { Pipe, PipeTransform } from '@angular/core';

// "maría JOSÉ  rojas" -> "María José Rojas"
@Pipe({ name: 'nombrePropio', standalone: false })
export class NombrePropioPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return (valor ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((palabra) => palabra[0].toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }
}
