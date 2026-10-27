const modelos = require('../models');
const resolver = require('../middleware/resolverCompra');

const referencias = [
  ['proveedor', 'Proveedor', 'idProveedor', 'Proveedor de Prueba'],
  ['tipoPago', 'TipoPago', 'idTipoPago', 'Tarjeta'],
  ['tipoContenido', 'TipoContenido', 'idTipoContenido', 'Ropa'],
];

test('resuelve los nombres del formulario a ids', async () => {
  const body = { productos: [{ producto: 'Camisa', cantidad: 1 }] };
  for (const [campo, modelo, id, valor] of referencias) {
    body[campo] = valor;
    jest.spyOn(modelos[modelo], 'findOne').mockResolvedValue({ [id]: 4 });
  }

  jest.spyOn(modelos.Producto, 'findOne').mockResolvedValue({ idProducto: 6 });

  const next = jest.fn();

  await resolver({ body }, {}, next);
  for (const [, , id] of referencias) expect(body[id]).toBe(4);

  expect(body.productos[0].idProducto).toBe(6);
  expect(next).toHaveBeenCalled();
});

test.each(referencias)('rechaza referencia ausente %s', async (campo, modelo, id, valor) => {
  jest.spyOn(modelos[modelo], 'findOne').mockResolvedValue(null);
  await expect(resolver({ body: { [campo]: valor } }, {}, jest.fn())).rejects.toMatchObject({
    status: 400,
  });
});
