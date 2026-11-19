const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');
const { exigirCampos } = require('../utils/errores');
const { rolValido } = require('../utils/permisos');

const MAX_INTENTOS = 5;
const MINUTOS_SUSPENSION = 15;

const minutosRestantes = (hasta) => Math.ceil((new Date(hasta) - Date.now()) / 60000);

// suma un intento fallido y suspende la cuenta al llegar al maximo
const registrarFallo = async (registro) => {
  const intentos = (registro.intentosFallidos || 0) + 1;
  if (intentos < MAX_INTENTOS) {
    await registro.update({ intentosFallidos: intentos });
    return false;
  }
  await registro.update({
    intentosFallidos: 0,
    bloqueadoHasta: new Date(Date.now() + MINUTOS_SUSPENSION * 60000),
  });
  return true;
};

const login = async (req, res) => {
  exigirCampos(req.body, ['correo', 'contrasena']);

  const { correo, contrasena } = req.body;
  if (typeof correo !== 'string' || typeof contrasena !== 'string')
    return res.status(400).json({ error: 'Credenciales no validas' });

  const registro = await Usuario.findOne({
    where: { correo: correo.trim().toLowerCase() },
    include: [{ model: Rol, as: 'rol' }],
  });
  if (registro?.bloqueadoHasta && new Date(registro.bloqueadoHasta) > Date.now())
    return res.status(423).json({
      error: `La cuenta está suspendida temporalmente. Intenta nuevamente en ${minutosRestantes(registro.bloqueadoHasta)} minutos`,
    });

  const valido = registro && (await bcrypt.compare(contrasena, registro.contrasenaHash));
  if (!valido) {
    if (registro && (await registrarFallo(registro)))
      return res.status(423).json({
        error: `La cuenta quedó suspendida por ${MINUTOS_SUSPENSION} minutos tras ${MAX_INTENTOS} intentos fallidos`,
      });
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  if (registro.intentosFallidos || registro.bloqueadoHasta)
    await registro.update({ intentosFallidos: 0, bloqueadoHasta: null });

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
    expiresIn: process.env.JWT_EXPIRA || '30d',
  });

  res.json({ usuario, token });
};

const perfil = (req, res) => res.json(req.user);

module.exports = { login, perfil };
