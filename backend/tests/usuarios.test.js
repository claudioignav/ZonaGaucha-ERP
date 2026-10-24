const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app');
const { Usuario, Rol } = require('../models');
const usuarios = require('../controllers/usuarioController');
const { crearRegistro, ejecutar } = require('./helpers');

const claveDePrueba = randomUUID();

const usuarioBd = (cambios = {}) =>
  crearRegistro({
    idUsuario: 2,
    nombre: 'Luis',
    apellidos: 'Soto',
    correo: 'luis@zonagaucha.cl',
    activo: true,
    rol: { nombre: 'Usuario' },
    ...cambios,
  });

describe('listado y registro de cuentas', () => {
  test('lista cuentas activas y eliminadas sin exponer el hash', async () => {
    const buscar = jest.spyOn(Usuario, 'findAll').mockResolvedValue([
      usuarioBd({ contrasenaHash: 'hash-no-publico' }),
      usuarioBd({ idUsuario: 3, activo: false }),
    ]);

    const res = await ejecutar(usuarios.listar);
    const resultado = res.json.mock.calls[0][0];

    expect(buscar).toHaveBeenCalledWith(expect.objectContaining({
      attributes: { exclude: ['contrasenaHash'] },
    }));
    expect(resultado).toEqual([
      expect.objectContaining({ id: 2, rol: 'Usuario', estado: 'Activo' }),
      expect.objectContaining({ id: 3, estado: 'Eliminado' }),
    ]);
    expect(resultado[0]).not.toHaveProperty('contrasenaHash');
  });

  test('normaliza el correo y guarda una contraseña verificable con bcrypt', async () => {
    jest.spyOn(Rol, 'findOne').mockResolvedValue({ idRol: 2 });
    const crear = jest.spyOn(Usuario, 'create').mockResolvedValue({ idUsuario: 2 });
    jest.spyOn(Usuario, 'findByPk').mockResolvedValue(usuarioBd());

    const res = await ejecutar(usuarios.crear, {
      body: {
        nombre: 'Luis',
        apellidos: 'Soto',
        correo: ' LUIS@zonagaucha.cl ',
        contrasena: claveDePrueba,
        rol: 'Usuario',
      },
    });

    const guardado = crear.mock.calls[0][0];
    expect(guardado).toMatchObject({ correo: 'luis@zonagaucha.cl', idRol: 2 });
    expect(await bcrypt.compare(claveDePrueba, guardado.contrasenaHash)).toBe(true);
    expect(guardado).not.toHaveProperty('contrasena');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0]).not.toHaveProperty('contrasenaHash');
  });

  test('rechaza el registro incompleto antes de guardar', async () => {
    const crear = jest.spyOn(Usuario, 'create');

    await expect(ejecutar(usuarios.crear, { body: { nombre: 'Luis' } }))
      .rejects.toMatchObject({ status: 400 });

    expect(crear).not.toHaveBeenCalled();
  });

  test('rechaza un perfil no admitido antes de consultar el rol o guardar', async () => {
    const buscarRol = jest.spyOn(Rol, 'findOne');
    const crear = jest.spyOn(Usuario, 'create');

    await expect(ejecutar(usuarios.crear, {
      body: {
        nombre: 'Luis', apellidos: 'Soto', correo: 'luis@zonagaucha.cl',
        contrasena: claveDePrueba, rol: 'Operador',
      },
    })).rejects.toMatchObject({ status: 400 });

    expect(buscarRol).not.toHaveBeenCalled();
    expect(crear).not.toHaveBeenCalled();
  });

  test('rechaza un rol admitido que no existe en la base', async () => {
    jest.spyOn(Rol, 'findOne').mockResolvedValue(null);
    const crear = jest.spyOn(Usuario, 'create');

    await expect(ejecutar(usuarios.crear, {
      body: {
        nombre: 'Luis', apellidos: 'Soto', correo: 'luis@zonagaucha.cl',
        contrasena: claveDePrueba, rol: 'Usuario',
      },
    })).rejects.toMatchObject({ status: 400 });

    expect(crear).not.toHaveBeenCalled();
  });

  test('el listado exige autenticación', async () => {
    const buscar = jest.spyOn(Usuario, 'findAll');

    expect((await request(app).get('/usuarios')).status).toBe(401);
    expect(buscar).not.toHaveBeenCalled();
  });

  test('una cuenta sin rol de administrador no puede consultar usuarios', async () => {
    jest.spyOn(Usuario, 'findByPk').mockResolvedValue(usuarioBd());
    const buscar = jest.spyOn(Usuario, 'findAll');
    const token = jwt.sign({ id: 2 }, process.env.JWT_SECRET, { expiresIn: '5m' });

    const respuesta = await request(app).get('/usuarios').auth(token, { type: 'bearer' });

    expect(respuesta.status).toBe(403);
    expect(buscar).not.toHaveBeenCalled();
  });
});

describe('edición y estado de cuentas', () => {
  test('al editar sin clave no se toca el hash', async () => {
    const usuario = usuarioBd();

    jest.spyOn(Usuario, 'findByPk').mockResolvedValue(usuario);
    jest.spyOn(Rol, 'findOne').mockResolvedValue({ idRol: 1 });

    await ejecutar(usuarios.actualizar, {
      params: { id: '2' },
      body: { nombre: 'Luis A.', correo: 'NUEVO@zonagaucha.cl', rol: 'Administrador' },
    });

    const cambios = usuario.update.mock.calls[0][0];

    expect(cambios).toMatchObject({ nombre: 'Luis A.', correo: 'nuevo@zonagaucha.cl', idRol: 1 });
    expect(cambios.contrasenaHash).toBeUndefined();
  });

  test('al editar con clave nueva se vuelve a hashear', async () => {
    const usuario = usuarioBd();

    jest.spyOn(Usuario, 'findByPk').mockResolvedValue(usuario);

    await ejecutar(usuarios.actualizar, { params: { id: '2' }, body: { contrasena: claveDePrueba } });

    expect(await bcrypt.compare(claveDePrueba, usuario.update.mock.calls[0][0].contrasenaHash)).toBe(true);
  });

  test('eliminar y restaurar cambian el estado', async () => {
    const usuario = usuarioBd();

    jest.spyOn(Usuario, 'findByPk').mockResolvedValue(usuario);

    const eliminado = await ejecutar(usuarios.eliminar, { params: { id: '2' } });

    expect(eliminado.json.mock.calls[0][0].estado).toBe('Eliminado');

    const restaurado = await ejecutar(usuarios.restaurar, { params: { id: '2' } });

    expect(restaurado.json.mock.calls[0][0].estado).toBe('Activo');
  });

  test('nadie puede eliminarse a si mismo', async () => {
    await expect(ejecutar(usuarios.eliminar, { params: { id: '1' } })).rejects.toMatchObject({
      status: 400,
    });
  });

  test('si el usuario no existe responde 404', async () => {
    jest.spyOn(Usuario, 'findByPk').mockResolvedValue(null);

    await expect(ejecutar(usuarios.restaurar, { params: { id: '99' } })).rejects.toMatchObject({
      status: 404,
    });
  });

  test('al editar rechaza un perfil no admitido sin cambiar la cuenta', async () => {
    const usuario = usuarioBd();
    jest.spyOn(Usuario, 'findByPk').mockResolvedValue(usuario);
    const buscarRol = jest.spyOn(Rol, 'findOne');

    await expect(ejecutar(usuarios.actualizar, {
      params: { id: '2' }, body: { rol: 'Operador' },
    })).rejects.toMatchObject({ status: 400 });

    expect(buscarRol).not.toHaveBeenCalled();
    expect(usuario.update).not.toHaveBeenCalled();
  });
});
