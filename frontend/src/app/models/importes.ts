// los importes se operan en centavos enteros para que el total no dependa del redondeo del punto flotante.

export interface LineaImporte {
  cantidad: number | string;
  precioUnitario?: number | string | null;
}

export const aCentavos = (valor: number | string | null | undefined): number =>
  Math.round((Number(valor) || 0) * 100);

// cantidad por precio unitario, el resultado queda en pesos con hasta dos decimales.
export const subtotalLinea = (linea: LineaImporte): number =>
  Math.round(aCentavos(linea.precioUnitario) * (Number(linea.cantidad) || 0)) / 100;

// el total es la suma de los subtotales, no la suma de cantidades y precios.
export const totalLineas = (lineas: LineaImporte[]): number =>
  lineas.reduce((suma, linea) => suma + aCentavos(subtotalLinea(linea)), 0) / 100;

export interface ImpuestoInterpretado {
  valido: boolean;
  porcentaje: boolean;
  valor: number;
}

// admite "19%", "19,5%", "190" o "$190", cualquier otro texto no es un impuesto valido.
const FORMATO_IMPUESTO = /^\s*\$?\s*\d+([.,]\d+)?\s*%?\s*$/;

export const interpretarImpuesto = (texto: number | string | null | undefined): ImpuestoInterpretado => {
  const original = String(texto ?? '').trim();

  if (original === '') return { valido: true, porcentaje: false, valor: 0 };
  if (!FORMATO_IMPUESTO.test(original)) return { valido: false, porcentaje: false, valor: 0 };

  return {
    valido: true,
    porcentaje: original.endsWith('%'),
    valor: Number(original.replace(/[$%\s]/g, '').replace(',', '.')),
  };
};

// el impuesto puede escribirse como porcentaje sobre la bruta o como monto.
export const impuestoDe = (bruta: number, impuesto: number | string | null | undefined): number => {
  const { porcentaje, valor } = interpretarImpuesto(impuesto);

  if (porcentaje) return Math.round((aCentavos(bruta) * valor) / 100) / 100;

  return aCentavos(valor) / 100;
};

export const netoDe = (bruta: number, impuesto: number): number =>
  (aCentavos(bruta) + aCentavos(impuesto)) / 100;
