const crypto = require('node:crypto');
const { cifrarReporte } = require('../utils/cifradoReporte');

test('permite recuperar el contenido simulado de un reporte', () => {
  const clave = crypto.randomBytes(24);
  const texto = 'Reporte simulado de ventas e inventario';

  const resultado = cifrarReporte(texto, clave);
  const descifrador = crypto.createDecipheriv(
    'des-ede3-cbc',
    clave,
    Buffer.from(resultado.iv, 'hex'),
  );
  const recuperado = Buffer.concat([
    descifrador.update(Buffer.from(resultado.contenido, 'hex')),
    descifrador.final(),
  ]).toString('utf8');

  expect(resultado.iv).toHaveLength(16);
  expect(recuperado).toBe(texto);
});
