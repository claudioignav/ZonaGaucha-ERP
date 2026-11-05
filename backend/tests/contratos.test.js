const { randomUUID } = require('node:crypto');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const modelos = require('../models');
const app = require('../app');
const { crearRegistro, simularTransaccion } = require('./helpers');

beforeEach(() => {
  jest.spyOn(modelos.Usuario, 'findByPk').mockResolvedValue({
    idUsuario: 7,
    nombre: 'Ana',
    activo: true,
    rol: { nombre: 'Administrador' },
  });
});

const token = () => jwt.sign({ id: 7 }, process.env.JWT_SECRET);

test('el login por http devuelve identidad real y jwt', async () => {
  const claveDePrueba = randomUUID();
  const contrasenaHash = await bcrypt.hash(claveDePrueba, 4);

  jest.spyOn(modelos.Usuario, 'findOne').mockResolvedValue({
    idUsuario: 7,
    nombre: 'Ana',
    apellidos: 'Rojas',
    activo: true,
    contrasenaHash,
    rol: { nombre: 'Administrador' },
  });

  const respuesta = await request(app)
    .post('/auth/login')
    .send({ correo: 'ana@correo.cl', contrasena: claveDePrueba });

  expect(respuesta.status).toBe(200);
  expect(jwt.verify(respuesta.body.token, process.env.JWT_SECRET).id).toBe(7);
  expect(respuesta.body.usuario.nombre).toBe('Ana');
});

test('recibe el formulario de compra tal como lo envia Angular', async () => {
  simularTransaccion();
  for (const [modelo, id] of [
    ['Proveedor', 'idProveedor'],
    ['TipoPago', 'idTipoPago'],
    ['TipoContenido', 'idTipoContenido'],
    ['Producto', 'idProducto'],
  ])
    jest.spyOn(modelos[modelo], 'findOne').mockResolvedValue({ [id]: 1 });

  const crear = jest.spyOn(modelos.Compra, 'create').mockResolvedValue({ idCompra: 2 });

  jest.spyOn(modelos.Lote, 'create').mockResolvedValue({ idLote: 3 });
  jest.spyOn(modelos.DetalleLote, 'bulkCreate').mockResolvedValue([]);

  const respuesta = await request(app)
    .post('/compras')
    .set('Authorization', 'Bearer ' + token())
    .send({
      numeroFactura: 'F1',
      numeroLote: '12',
      proveedor: 'Proveedor',
      tipoPago: 'Tarjeta',
      tipoContenido: 'Ropa',
      fechaCompra: '2026-10-07T12:00',
      compraBruta: 1000,
      impuesto: 190,
      productos: [{ producto: 'Camisa', cantidad: 10, precioUnitario: 100 }],
    });

  expect(respuesta.status).toBe(201);
  expect(respuesta.body.compraNeta).toBe(1190);
  expect(crear.mock.calls[0][0].idUsuario).toBe(7);
});

test('recibe el formulario de venta y asigna documento sin pedirlo en pantalla', async () => {
  simularTransaccion();
  for (const [modelo, id] of [
    ['Lote', 'idLote'],
    ['Plataforma', 'idPlataforma'],
    ['TipoPago', 'idTipoPago'],
    ['Producto', 'idProducto'],
  ])
    jest.spyOn(modelos[modelo], 'findOne').mockResolvedValue({ [id]: 1 });

  jest.spyOn(modelos.PlataformaTipoPago, 'findOne').mockResolvedValue({});

  const buscarStock = jest
    .spyOn(modelos.DetalleLote, 'findOne')
    .mockResolvedValue(crearRegistro({ cantidadDisponible: 10 }));
  const crear = jest.spyOn(modelos.Venta, 'create').mockResolvedValue({ idVenta: 2 });

  jest.spyOn(modelos.DetalleVenta, 'bulkCreate').mockResolvedValue([]);

  const respuesta = await request(app)
    .post('/ventas')
    .set('Authorization', 'Bearer ' + token())
    .send({
      cliente: 'Cliente',
      fechaVenta: '2026-10-07T12:00',
      plataforma: 'Web',
      tipoPago: 'Tarjeta',
      lote: '12',
      valorBruto: 2000,
      valorAdicional: 100,
      productos: [{ producto: 'Camisa', cantidad: 2, precioUnitario: 1000 }],
    });

  expect(respuesta.status).toBe(201);
  expect(respuesta.body.valorNeto).toBe(2100);
  expect(crear.mock.calls[0][0].numeroDocumento).toHaveLength(20);
  expect(buscarStock.mock.calls[0][0].tableHint).toBe('UPDLOCK');
});

test('un usuario normal no administra cuentas', async () => {
  modelos.Usuario.findByPk.mockResolvedValue({
    idUsuario: 7,
    nombre: 'Ana',
    activo: true,
    rol: { nombre: 'Usuario' },
  });

  expect(
    (
      await request(app)
        .get('/usuarios')
        .set('Authorization', 'Bearer ' + token())
    ).status,
  ).toBe(403);
});
