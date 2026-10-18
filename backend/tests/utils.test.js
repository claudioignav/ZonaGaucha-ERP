const { exigirCampos, buscarOFallar } = require('../utils/errores');

test('exige los campos obligatorios', () => {
  expect(() => exigirCampos({}, ['correo'])).toThrow('correo');
  expect(() => exigirCampos({ correo: 'a@b.cl' }, ['correo'])).not.toThrow();
});

test('busca registros y responde 404 si faltan', async () => {
  const modelo = { findByPk: jest.fn().mockResolvedValue(null) };

  await expect(buscarOFallar(modelo, 2)).rejects.toMatchObject({ status: 404 });
  modelo.findByPk.mockResolvedValue({ id: 2 });

  expect(await buscarOFallar(modelo, 2)).toEqual({ id: 2 });
});
