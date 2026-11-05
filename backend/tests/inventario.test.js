const { Lote, DetalleLote } = require('../models');
const inventario = require('../controllers/inventarioController');
const { ejecutar } = require('./helpers');

test('lista lote con existencias proveedor y factura', async () => {
  jest.spyOn(Lote, 'findAll').mockResolvedValue([
    {
      numeroLote: 12,
      compra: {
        numeroFactura: 'F1',
        fechaCompra: '2026-10-07',
        proveedor: { razonSocial: 'Proveedor' },
      },
      tipoContenido: { nombre: 'Ropa' },
      detalles: [{ cantidadIngresada: 10, cantidadDisponible: 4 }],
    },
  ]);

  expect((await ejecutar(inventario.listarLotes)).json.mock.calls[0][0][0]).toMatchObject({
    numero: 12,
    unidadesTotales: 10,
    unidadesDisponibles: 4,
  });
});

test('calcula porcentaje vendido y maneja inventario vacio', async () => {
  const sumar = jest.spyOn(DetalleLote, 'sum').mockResolvedValueOnce(10).mockResolvedValueOnce(4);

  expect((await ejecutar(inventario.resumen)).json.mock.calls[0][0].promedioVenta).toBe(60);

  sumar.mockResolvedValue(0);

  expect((await ejecutar(inventario.resumen)).json.mock.calls[0][0].promedioVenta).toBe(0);
});

test('entrega solo la fecha aunque sql devuelva un objeto Date', async () => {
  jest
    .spyOn(Lote, 'findAll')
    .mockResolvedValue([
      { numeroLote: 12, compra: { fechaCompra: new Date('2026-10-07T12:00:00Z') }, detalles: [] },
    ]);

  expect((await ejecutar(inventario.listarLotes)).json.mock.calls[0][0][0].fechaCreacion).toBe(
    '2026-10-07',
  );
});
