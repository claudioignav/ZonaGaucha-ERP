const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const modelos = require('../models');
const { crearRegistro, simularTransaccion } = require('./helpers');

const cabecera = rol => {
  jest.spyOn(modelos.Usuario, 'findByPk').mockResolvedValue({
    idUsuario: 1, activo: true, nombre: 'Ana', rol: { nombre: rol },
  });
  return 'Bearer ' + jwt.sign({ id: 1, rol: 'Administrador' }, process.env.JWT_SECRET);
};

test.each(['/dashboard', '/usuarios', '/compras/resumen', '/ventas/resumen'])(
  'el usuario recibe 403 en %s aunque el token diga administrador', async ruta => {
    const respuesta = await request(app).get(ruta).set('Authorization', cabecera('Usuario'));
    expect(respuesta.status).toBe(403);
  },
);

test.each(['put', 'patch', 'delete'].flatMap(metodo =>
  ['/compras/1', '/ventas/1'].map(ruta => [metodo, ruta]),
))('el usuario no puede %s %s', async (metodo, ruta) => {
  expect((await request(app)[metodo](ruta).set('Authorization', cabecera('Usuario')).send({})).status).toBe(403);
});

test.each(['Usuario', 'Administrador'])('%s puede consultar inventario y catalogos', async rol => {
  const header = cabecera(rol);
  jest.spyOn(modelos.Lote, 'findAll').mockResolvedValue([]);
  jest.spyOn(modelos.Producto, 'findAll').mockResolvedValue([]);
  expect((await request(app).get('/inventario/lotes').set('Authorization', header)).status).toBe(200);
  expect((await request(app).get('/catalogos/productos').set('Authorization', header)).status).toBe(200);
});

test.each(['Usuario', 'Administrador'])('%s puede enviar un registro de compra o venta', async rol => {
  const header = cabecera(rol);
  for (const ruta of ['/compras', '/ventas']) {
    const respuesta = await request(app).post(ruta).set('Authorization', header).send({});
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).not.toContain('permiso');
  }
});

test('el administrador puede consultar las metricas financieras', async () => {
  const header = cabecera('Administrador');
  for (const nombre of ['Producto', 'Usuario', 'Proveedor', 'CategoriaProducto'])
    jest.spyOn(modelos[nombre], 'count').mockResolvedValue(0);
  jest.spyOn(modelos.Venta, 'sum').mockResolvedValue(0);
  jest.spyOn(modelos.Compra, 'sum').mockResolvedValue(0);
  jest.spyOn(modelos.Venta, 'findAll').mockResolvedValue([]);
  jest.spyOn(modelos.Compra, 'findAll').mockResolvedValue([]);
  for (const ruta of ['/dashboard', '/compras/resumen', '/ventas/resumen'])
    expect((await request(app).get(ruta).set('Authorization', header)).status).toBe(200);
});

test('un token valido con una cuenta de perfil desconocido no obtiene acceso', async () => {
  expect((await request(app).get('/inventario/lotes').set('Authorization', cabecera('Operador'))).status).toBe(403);
});

test.each(['Usuario', 'Administrador'])('%s puede registrar compra y venta con datos validos', async rol => {
  const header = cabecera(rol);
  simularTransaccion();
  const compra = jest.spyOn(modelos.Compra, 'create').mockResolvedValue({ idCompra: 9 });
  jest.spyOn(modelos.Lote, 'create').mockResolvedValue({ idLote: 3 });
  jest.spyOn(modelos.DetalleLote, 'bulkCreate').mockResolvedValue([]);
  const respuestaCompra = await request(app).post('/compras').set('Authorization', header).send({
    numeroFactura: 'F-100', numeroLote: 1426, idProveedor: 1, idTipoPago: 1,
    idTipoContenido: 1, fechaCompra: '2026-10-12', compraBruta: 100000,
    impuesto: 19000, productos: [{ idProducto: 5, cantidad: 25, precioUnitario: 4000 }], idUsuario: 999,
  });
  expect(respuestaCompra.status).toBe(201);
  expect(compra.mock.calls[0][0].idUsuario).toBe(1);
  jest.spyOn(modelos.PlataformaTipoPago, 'findOne').mockResolvedValue({});
  jest.spyOn(modelos.DetalleLote, 'findOne').mockResolvedValue(crearRegistro({ cantidadDisponible: 30 }));
  const venta = jest.spyOn(modelos.Venta, 'create').mockResolvedValue({ idVenta: 8 });
  jest.spyOn(modelos.DetalleVenta, 'bulkCreate').mockResolvedValue([]);
  const respuestaVenta = await request(app).post('/ventas').set('Authorization', header).send({
    numeroDocumento: 'B-55', nombreCliente: 'Cliente de Prueba', fechaVenta: '2026-10-12',
    idPlataforma: 1, idTipoPago: 1, idLote: 3, valorBruto: 20000, valorAdicional: 0,
    productos: [{ idProducto: 5, cantidad: 2, precioUnitario: 10000 }], idUsuario: 999,
  });
  expect(respuestaVenta.status).toBe(201);
  expect(venta.mock.calls[0][0].idUsuario).toBe(1);
});

test.each(['Usuario', 'Administrador'])('%s puede crear editar y eliminar un catalogo', async rol => {
  const header = cabecera(rol);
  const producto = crearRegistro({ idProducto: 1, nombre: 'Camisa', idCategoria: 1 });
  jest.spyOn(modelos.Producto, 'create').mockResolvedValue(producto);
  jest.spyOn(modelos.Producto, 'findByPk').mockResolvedValue(producto);
  expect((await request(app).post('/catalogos/productos').set('Authorization', header)
    .send({ nombre: 'Camisa', idCategoria: 1 })).status).toBe(201);
  expect((await request(app).put('/catalogos/productos/1').set('Authorization', header)
    .send({ nombre: 'Camisa azul' })).status).toBe(200);
  expect((await request(app).delete('/catalogos/productos/1').set('Authorization', header)).status).toBe(204);
  expect(producto.update).toHaveBeenCalledWith({ nombre: 'Camisa azul' });
  expect(producto.destroy).toHaveBeenCalledTimes(1);
});
