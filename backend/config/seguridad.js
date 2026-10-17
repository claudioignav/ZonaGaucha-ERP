const { validarJWT } = require('./jwt');

const validarSeguridad = (variables) => {
  validarJWT(variables);

  const origenes = {
    staging: 'https://zgerpfrontstg.z15.web.core.windows.net',
    production: 'https://zgerpfrontapp.z15.web.core.windows.net',
  };
  if (!origenes[variables.APP_ENV] || variables.FRONT_URL !== origenes[variables.APP_ENV])
    throw new Error('FRONT_URL no corresponde al entorno');

  return variables.FRONT_URL;
};

module.exports = { validarSeguridad };
