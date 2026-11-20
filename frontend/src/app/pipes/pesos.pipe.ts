import { Pipe, PipeTransform } from '@angular/core';

const formatoPesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

// 150000 -> "$150.000"
@Pipe({ name: 'pesos', standalone: false })
export class PesosPipe implements PipeTransform {
  transform(valor: number | string | null | undefined): string {
    const numero = Number(valor);
    return formatoPesos.format(Number.isFinite(numero) ? numero : 0);
  }
}
