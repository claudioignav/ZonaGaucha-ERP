const { Op } = require('sequelize');
const { normalizarRut, calcularDv } = require('../utils/rut');
const { filtroFechas, fechaHoy } = require('../utils/consultas');
const { exigirCampos, buscarOFallar } = require('../utils/errores');

describe('rut', () => {
  test.each([
    ['12.345.678-5', '12345678-5'],
    ['123456785', '12345678-5'],
    ['6.059.032-k', '6059032-K'],
    ['76543216', '7654321-6'],
  ])('%s se guarda como %s', (escrito, guardado) => {
    expect(normalizarRut(escrito)).toBe(guardado);
  });

  test('si no viene el digito verificador lo calcula', () => {
    expect(normalizarRut('12.345.678')).toBe('12345678-5');
  });

  test.each(['12.345.678-9', '123', 'abc', ''])('%s no sirve', (rut) => {
    expect(normalizarRut(rut)).toBeNull();
  });

  test('el digito puede salir 0', () => {
    expect(calcularDv('1000013')).toBe('0');
  });
});

describe('fechas', () => {
  test('sin fechas no filtra nada', () => {
    expect(filtroFechas('fechaVenta')).toEqual({});
  });

  test('con las dos fechas arma el rango completo del dia', () => {
    const filtro = filtroFechas('fechaVenta', '2026-10-01', '2026-10-31');

    expect(filtro.fechaVenta[Op.gte].getDate()).toBe(1);
    expect(filtro.fechaVenta[Op.lte].getHours()).toBe(23);
  });

  test('la fecha de hoy va en formato estandar con hora', () => {
    expect(fechaHoy()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe('errores', () => {
  test('exigirCampos nombra los campos que faltan', () => {
    expect(() => exigirCampos({ nombre: 'x', correo: '' }, ['nombre', 'correo', 'rol'])).toThrow(
      'correo, rol',
    );
  });

  test('buscarOFallar corta con 404 si no existe', async () => {
    const modelo = { findByPk: jest.fn().mockResolvedValue(null) };

    await expect(buscarOFallar(modelo, 99)).rejects.toMatchObject({ status: 404 });
  });
});

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
