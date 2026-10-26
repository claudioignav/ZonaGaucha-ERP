const { randomUUID } = require('node:crypto');

process.env.APP_ENV = 'staging';
process.env.DB_HOST = 'zg-dbserver.database.windows.net';
process.env.DB_NAME = 'sqldb-zonagaucha-stg';
process.env.DB_USER = randomUUID();
process.env.DB_PASS = randomUUID();

process.env.JWT_SECRET = 'clave-larga-exclusiva-para-pruebas-unitarias';

process.env.FRONT_URL = 'https://zgerpfrontstg.z15.web.core.windows.net';
