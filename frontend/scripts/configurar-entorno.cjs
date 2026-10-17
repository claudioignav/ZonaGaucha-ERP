const fs = require('node:fs');
const path = require('node:path');

const [entorno, destino] = process.argv.slice(2);
const urls = {
  staging: 'https://zgerpbackstg.azurewebsites.net',
  production: 'https://zgerpbacktapp.azurewebsites.net',
};

if (!urls[entorno] || !destino)
  throw new Error('Uso: node scripts/configurar-entorno.cjs staging|production <carpeta browser>');

const carpeta = path.resolve(destino);

if (!fs.existsSync(path.join(carpeta, 'index.html')))
  throw new Error('No se encontro el compilado del frontend');

fs.writeFileSync(
  path.join(carpeta, 'config.js'),
  'window.ZONAGAUCHA_CONFIG = ' + JSON.stringify({ apiUrl: urls[entorno] }) + ';\n',
);
