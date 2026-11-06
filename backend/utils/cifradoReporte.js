const crypto = require('node:crypto');

const cifrarReporte = (texto, clave) => {
  const iv = crypto.randomBytes(8);
  const cifrador = crypto.createCipheriv('des-ede3-cbc', clave, iv);
  const contenido = Buffer.concat([cifrador.update(texto, 'utf8'), cifrador.final()]);

  return { iv: iv.toString('hex'), contenido: contenido.toString('hex') };
};

module.exports = { cifrarReporte };
