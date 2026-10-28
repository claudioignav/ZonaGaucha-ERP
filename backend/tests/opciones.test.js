const modelos = require('../models');
const opciones = require('../controllers/opcionesController');
const { ejecutar } = require('./helpers');

test('devuelve opciones de compras desde los catalogos', async () => {
  for (const nombre of ['Proveedor', 'TipoPago', 'TipoContenido', 'Producto'])
    jest
      .spyOn(modelos[nombre], 'findAll')
      .mockResolvedValue([{ nombre: 'Prueba', razonSocial: 'Proveedor de Prueba' }]);

  expect((await ejecutar(opciones.compras)).json.mock.calls[0][0]).toEqual({
    proveedores: ['Proveedor de Prueba'],
    tiposPago: ['Prueba'],
    tiposContenido: ['Prueba'],
    productos: ['Prueba'],
  });
});

test('devuelve lotes reales y opciones de ventas', async () => {
  for (const nombre of ['Plataforma', 'TipoPago', 'Producto'])
    jest.spyOn(modelos[nombre], 'findAll').mockResolvedValue([{ nombre: 'Prueba' }]);

  jest.spyOn(modelos.Lote, 'findAll').mockResolvedValue([{ numeroLote: 12 }]);

  expect((await ejecutar(opciones.ventas)).json.mock.calls[0][0].lotes).toEqual(['12']);
});

test('las opciones de ventas traen el precio de catalogo de cada producto', async () => {
  for (const nombre of ['Plataforma', 'TipoPago', 'Lote'])
    jest.spyOn(modelos[nombre], 'findAll').mockResolvedValue([]);

  jest.spyOn(modelos.Producto, 'findAll').mockResolvedValue([
    { nombre: 'Boina', precioVenta: '12990.00' },
    { nombre: 'Faja', precioVenta: null },
  ]);

  expect((await ejecutar(opciones.ventas)).json.mock.calls[0][0].preciosProductos).toEqual([
    { nombre: 'Boina', precioVenta: 12990 },
    { nombre: 'Faja', precioVenta: null },
  ]);
});
