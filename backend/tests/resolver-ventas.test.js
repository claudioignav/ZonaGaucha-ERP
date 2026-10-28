const modelos = require('../models');
const resolver = require('../middleware/resolverVenta');

const referencias = [
  ['lote', 'Lote', 'idLote', '12'],
  ['plataforma', 'Plataforma', 'idPlataforma', 'Web'],
  ['tipoPago', 'TipoPago', 'idTipoPago', 'Tarjeta'],
];

test('resuelve los nombres del formulario a ids', async () => {
  const body = {
    productos: [{ producto: 'Camisa', cantidad: 1 }],
    cliente: 'Cliente',
  };
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
  expect(body.nombreCliente).toBe('Cliente');
});
