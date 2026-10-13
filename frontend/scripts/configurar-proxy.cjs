const fs = require('node:fs');

const archivo = 'angular.json';
const configuracion = JSON.parse(fs.readFileSync(archivo, 'utf8'));
const proyecto = Object.values(configuracion.projects).find((p) => p.projectType === 'application');

proyecto.architect.serve.options = {
  ...proyecto.architect.serve.options,
  proxyConfig: 'proxy.conf.json',
};

fs.writeFileSync(archivo, JSON.stringify(configuracion, null, 2) + '\n');
