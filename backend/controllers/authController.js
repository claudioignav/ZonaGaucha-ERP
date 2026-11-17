const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');
const { exigirCampos } = require('../utils/errores');
const { rolValido } = require('../utils/permisos');

const login = async (req, res) => {
  exigirCampos(req.body, ['correo', 'contrasena']);

  const { correo, contrasena } = req.body;
  if (typeof correo !== 'string' || typeof contrasena !== 'string')
    return res.status(400).json({ error: 'Credenciales no validas' });

  const registro = await Usuario.findOne({
    where: { correo: correo.trim().toLowerCase() },
    include: [{ model: Rol, as: 'rol' }],
  });
  const valido = registro && (await bcrypt.compare(contrasena, registro.contrasenaHash));
  if (!valido) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

  if (!registro.activo) return res.status(403).json({ error: 'La cuenta está desactivada' });

  if (!rolValido(registro.rol?.nombre))
    return res.status(403).json({ error: 'El perfil de la cuenta no tiene acceso al sistema' });

  const usuario = {
    id: registro.idUsuario,
    nombre: registro.nombre,
    apellidos: registro.apellidos,
    rol: registro.rol.nombre,
  };
  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRA || '2h',
  });

  res.json({ usuario, token });
};

const perfil = (req, res) => res.json(req.user);

module.exports = { login, perfil };
