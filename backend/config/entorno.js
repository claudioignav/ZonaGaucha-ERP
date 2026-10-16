const bases = { staging: 'sqldb-zonagaucha-stg', production: 'sqldb-zonagaucha' };

const configurarBase = (variables) => {
  const entorno = variables.APP_ENV;
  if (!['staging', 'production'].includes(entorno))
    throw new Error('APP_ENV debe ser staging o production');

  for (const campo of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS']) {
    if (!variables[campo]) throw new Error('Falta ' + campo);
  }

  if (
    variables.DB_NAME !== bases[entorno] ||
    variables.DB_HOST !== 'zg-dbserver.database.windows.net'
  ) {
    throw new Error('La base no corresponde al entorno seleccionado');
  }

  const puerto = Number(variables.DB_PORT || 1433);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535)
    throw new Error('DB_PORT no es valido');

  return {
    database: variables.DB_NAME,
    username: variables.DB_USER,
    password: variables.DB_PASS,
    options: {
      host: variables.DB_HOST,
      port: puerto,
      dialect: 'mssql',
      logging: false,
      define: { underscored: true, timestamps: false },
      dialectOptions: {
        options: { encrypt: true, trustServerCertificate: false, useUTC: true },
      },
    },
  };
};

module.exports = { configurarBase };
