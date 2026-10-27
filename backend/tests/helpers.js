const { sequelize } = require('../models');

const crearRes = () => {
  const res = {};

  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.end = jest.fn(() => res);

  return res;
};

const crearRegistro = (datos = {}) => ({
  ...datos,
  update: jest.fn(async function (cambios) {
    Object.assign(this, cambios);
  }),
  reload: jest.fn(async () => {}),
  destroy: jest.fn(async () => {}),
  decrement: jest.fn(async () => {}),
});

const simularTransaccion = () =>
  jest
    .spyOn(sequelize, 'transaction')
    .mockImplementation((callback) => callback({ LOCK: { UPDATE: 'UPDATE' } }));

const ejecutar = async (controlador, req) => {
  const res = crearRes();

  await controlador(
    { params: {}, query: {}, body: {}, user: { id: 1, rol: 'Administrador' }, ...req },
    res,
  );

  return res;
};

module.exports = { crearRes, crearRegistro, simularTransaccion, ejecutar };
