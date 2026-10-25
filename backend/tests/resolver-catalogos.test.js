const { CategoriaProducto, TipoPago } = require('../models');
const resolver = require('../middleware/resolverCatalogo');

const req = (path, body, method = 'POST') => ({ path, body, method });

test('no busca referencias al listar', async () => {
  const next = jest.fn();

  await resolver(req('/productos', {}, 'GET'), {}, next);

  expect(next).toHaveBeenCalled();
});

test('resuelve categoria y tipos de pago', async () => {
  jest.spyOn(CategoriaProducto, 'findOne').mockResolvedValue({ idCategoria: 3 });
  jest.spyOn(TipoPago, 'findOne').mockResolvedValue({ idTipoPago: 5 });

  const producto = req('/productos', { categoria: 'Ropa' });

  await resolver(producto, {}, jest.fn());

  expect(producto.body.idCategoria).toBe(3);

  const plataforma = req('/plataformas', { tiposPago: ['Tarjeta'] });

  await resolver(plataforma, {}, jest.fn());

  expect(plataforma.body.idsTiposPago).toEqual([5]);
});

test('rechaza referencias ausentes', async () => {
  jest.spyOn(CategoriaProducto, 'findOne').mockResolvedValue(null);
  jest.spyOn(TipoPago, 'findOne').mockResolvedValue(null);
  await expect(
    resolver(req('/productos', { categoria: 'Otra' }), {}, jest.fn()),
  ).rejects.toMatchObject({ status: 400 });
  await expect(
    resolver(req('/plataformas', { tiposPago: [] }), {}, jest.fn()),
  ).rejects.toMatchObject({ status: 400 });
  await expect(
    resolver(req('/plataformas', { tiposPago: ['Otra'] }), {}, jest.fn()),
  ).rejects.toMatchObject({ status: 400 });
});

test('admite datos que ya traen ids y catalogos sin referencias', async () => {
  const next = jest.fn();

  await resolver(req('/productos', { idCategoria: 3 }), {}, next);
  await resolver(req('/tipos-pago', { nombre: 'Tarjeta' }), {}, next);

  expect(next).toHaveBeenCalledTimes(2);
});
