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

test('sin valores mantiene el listado completo', () => {
  expect(filtrar({ numeroFactura: '' }, 'fechaCompra', { numeroFactura: 'numeroFactura' })).toEqual(
    {},
  );
});

test('filtra por rango con los dias completos de desde y hasta', () => {
  const filtro = filtrar({ desde: '2026-11-01', hasta: '2026-11-15' }, 'fechaVenta', {});

  expect(filtro.fechaVenta[Op.gte]).toEqual(new Date('2026-11-01T00:00:00'));
  expect(filtro.fechaVenta[Op.lte]).toEqual(new Date('2026-11-15T23:59:59'));
});

test('acepta un rango abierto con solo desde o solo hasta', () => {
  expect(filtrar({ desde: '2026-11-01' }, 'fechaVenta', {}).fechaVenta[Op.lte]).toBeUndefined();
  expect(filtrar({ hasta: '2026-11-15' }, 'fechaVenta', {}).fechaVenta[Op.gte]).toBeUndefined();
});

test('rechaza un rango con desde posterior a hasta', () => {
  expect(() => filtrar({ desde: '2026-11-20', hasta: '2026-11-05' }, 'fechaVenta', {})).toThrow(
    'posterior',
  );
});
