import { Pipe, PipeTransform } from '@angular/core';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// la fecha llega en formato estandar "2026-08-16T14:30" (como la arma fechaDeHoy y como la manda el back)
// y se muestra como en los mockups:
//  - 'actual' (tarjeta fecha actual): "Ago 16, 2026 14:30"
//  - 'tabla' (ventas y compras):      "16-08-2026 14:30"
@Pipe({ name: 'fecha', standalone: false })
export class FechaPipe implements PipeTransform {
  transform(valor: string | null | undefined, formato: 'actual' | 'tabla' = 'actual'): string {
    if (!valor) return '';
    // se separa a mano, con new Date('2026-08-16') la fecha queda en utc y en chile sale el dia anterior
    const partes = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(valor);
    if (!partes) return valor;

    const [, anio, mes, dia, hora, minutos] = partes;
    const horaTexto = hora ? ` ${hora}:${minutos}` : '';
    if (formato === 'tabla') return `${dia}-${mes}-${anio}${horaTexto}`;
    return `${MESES[Number(mes) - 1]} ${Number(dia)}, ${anio}${horaTexto}`;
  }
}
