const bcrypt = require('bcrypt');
const { Usuario, Rol } = require('../models');
const { ErrorHttp, buscarOFallar, exigirCampos } = require('../utils/errores');
const { rolValido } = require('../utils/permisos');

const VUELTAS_BCRYPT = 10;
const incluirRol = [{ model: Rol, as: 'rol' }];

const formatearUsuario = (usuario) => ({
  id: usuario.idUsuario,
  nombre: usuario.nombre,
  apellidos: usuario.apellidos,
  correo: usuario.correo,
  telefono: usuario.telefono,
  rol: usuario.rol.nombre,
  estado: usuario.activo ? 'Activo' : 'Eliminado',
});

const buscarIdRol = async (nombreRol) => {
  if (!rolValido(nombreRol)) throw new ErrorHttp(400, 'Selecciona Administrador o Usuario');
  const rol = await Rol.findOne({ where: { nombre: nombreRol } });
  if (!rol) throw new ErrorHttp(400, `El rol ${nombreRol} no existe`);

  return rol.idRol;
};

const listar = async (req, res) => {
  const usuarios = await Usuario.findAll({
    attributes: { exclude: ['contrasenaHash'] },
    include: incluirRol,
    order: [['nombre', 'ASC']],
  });

  res.json(usuarios.map(formatearUsuario));
};

const crear = async (req, res) => {
  exigirCampos(req.body, ['nombre', 'apellidos', 'correo', 'contrasena', 'rol']);

  const { nombre, apellidos, correo, contrasena, telefono, rol } = req.body;

  const nuevo = await Usuario.create({
    nombre,
    apellidos,
    correo: correo.trim().toLowerCase(),
    telefono,
    idRol: await buscarIdRol(rol),
    contrasenaHash: await bcrypt.hash(contrasena, VUELTAS_BCRYPT),
  });

  const creado = await Usuario.findByPk(nuevo.idUsuario, { include: incluirRol });

  res.status(201).json(formatearUsuario(creado));
};

const actualizar = async (req, res) => {
  const usuario = await buscarOFallar(Usuario, req.params.id, { include: incluirRol });
  const { nombre, apellidos, correo, telefono, rol, contrasena } = req.body;

  const cambios = { nombre, apellidos, telefono };
  if (correo) cambios.correo = correo.trim().toLowerCase();

  if (rol) cambios.idRol = await buscarIdRol(rol);

  if (contrasena) cambios.contrasenaHash = await bcrypt.hash(contrasena, VUELTAS_BCRYPT);

  await usuario.update(cambios);
  await usuario.reload({ include: incluirRol });
  res.json(formatearUsuario(usuario));
};

const cambiarEstado = (activo) => async (req, res) => {
  if (!activo && req.user && Number(req.params.id) === req.user.id) {
    throw new ErrorHttp(400, 'No puedes eliminar tu propia cuenta');
  }

  const usuario = await buscarOFallar(Usuario, req.params.id, { include: incluirRol });

  await usuario.update({ activo });
  res.json(formatearUsuario(usuario));
};

module.exports = {
  listar,
  crear,
  actualizar,
  eliminar: cambiarEstado(false),
  restaurar: cambiarEstado(true),
};
