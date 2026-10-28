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

test.each(referencias)('rechaza referencia ausente %s', async (campo, modelo, id, valor) => {
  jest.spyOn(modelos[modelo], 'findOne').mockResolvedValue(null);
  await expect(resolver({ body: { [campo]: valor } }, {}, jest.fn())).rejects.toMatchObject({
    status: 400,
  });
});

test('rechaza producto ausente', async () => {
  jest.spyOn(modelos.Producto, 'findOne').mockResolvedValue(null);
  await expect(
    resolver({ body: { productos: [{ producto: 'Otro' }] } }, {}, jest.fn()),
  ).rejects.toMatchObject({ status: 400 });
});

test('permite ids ya resueltos', async () => {
  const next = jest.fn();

  await resolver({ body: { productos: [{ idProducto: 3 }] } }, {}, next);
  await resolver({ body: {} }, {}, next);

  expect(next).toHaveBeenCalledTimes(2);
});
