import { impuestoDe, interpretarImpuesto, netoDe, subtotalLinea, totalLineas } from './importes';

it('el subtotal es cantidad por precio sin error de punto flotante', () => {
  expect(subtotalLinea({ cantidad: 3, precioUnitario: 0.1 })).toBe(0.3);
  expect(subtotalLinea({ cantidad: 2, precioUnitario: null })).toBe(0);
});

it('el total suma los subtotales de las lineas', () => {
  expect(
    totalLineas([
      { cantidad: 3, precioUnitario: 0.1 },
      { cantidad: 1, precioUnitario: 0.2 },
    ]),
  ).toBe(0.5);
  expect(totalLineas([])).toBe(0);
});

it('el impuesto acepta porcentaje o monto', () => {
  expect(impuestoDe(2500000, '19%')).toBe(475000);
  expect(impuestoDe(1000, '19,5%')).toBe(195);
  expect(impuestoDe(2500000, '190')).toBe(190);
  expect(impuestoDe(1000, '$190')).toBe(190);
  expect(impuestoDe(1000, '')).toBe(0);
});

it('un impuesto con texto invalido no se toma como cero', () => {
  expect(interpretarImpuesto('abc').valido).toBe(false);
  expect(interpretarImpuesto('19%%').valido).toBe(false);
  expect(interpretarImpuesto('19%').valido).toBe(true);
  expect(interpretarImpuesto('').valido).toBe(true);
});

it('el neto es bruto mas impuesto', () => {
  expect(netoDe(1000, 190)).toBe(1190);
});
