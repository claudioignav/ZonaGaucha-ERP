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
