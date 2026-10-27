const { Op } = require('sequelize');
const { filtrar } = require('../utils/filtros');

test('filtra factura proveedor y fecha desde los campos de la pantalla', () => {
  const filtro = filtrar(
    { numeroFactura: 'F1', proveedor: 'Proveedor', fechaCompra: '2026-10-07' },
    'fechaCompra',
    { numeroFactura: 'numeroFactura', proveedor: '$proveedor.razonSocial$' },
  );

  expect(filtro.numeroFactura[Op.like]).toBe('%F1%');
  expect(filtro['$proveedor.razonSocial$'][Op.like]).toBe('%Proveedor%');
  expect(filtro.fechaCompra[Op.gte]).toBeInstanceOf(Date);
});

test('rechaza fechas y filtros con tipos no validos', () => {
  expect(() => filtrar({ fechaCompra: 'no-fecha' }, 'fechaCompra', {})).toThrow('Fecha');
  expect(() =>
    filtrar({ numeroFactura: ['F1'] }, 'fechaCompra', { numeroFactura: 'numeroFactura' }),
  ).toThrow('Filtro');
});
