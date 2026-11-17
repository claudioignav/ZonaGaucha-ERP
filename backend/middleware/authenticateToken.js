const { expressjwt } = require('express-jwt');
const { Usuario, Rol } = require('../models');
const { rolValido } = require('../utils/permisos');

const verificarJwt = expressjwt({
  secret: () => process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'datosToken',
});

const leerToken = (req) =>
  new Promise((resolve) => verificarJwt(req, {}, (error) => resolve(error ? null : req.datosToken)));

const authenticateToken = async (req, res, next) => {
  const coincidencia = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  if (!coincidencia) return res.status(401).json({ error: 'Token no proporcionado' });

  const datos = await leerToken(req);
  if (!datos) return res.status(401).json({ error: 'Token inválido o expirado' });

  const usuario = await Usuario.findByPk(datos.id, { include: [{ model: Rol, as: 'rol' }] });
  if (!usuario || !usuario.activo)
    return res.status(401).json({ error: 'La cuenta no está activa' });

  if (!rolValido(usuario.rol?.nombre))
    return res.status(403).json({ error: 'El perfil de la cuenta no tiene acceso al sistema' });

  req.user = { id: usuario.idUsuario, nombre: usuario.nombre, rol: usuario.rol.nombre };
  next();
};

module.exports = authenticateToken;
