const { createHash, timingSafeEqual } = require('node:crypto');
const { Router } = require('express');
const { registro } = require('../middleware/metricas');

const router = Router();

const hash = (valor) => createHash('sha256').update(valor).digest();

// las metricas solo se entregan con el token configurado
router.get('/', async (req, res) => {
  const token = process.env.METRICS_TOKEN;
  if (!token) return res.sendStatus(404);

  const credencial = /^Bearer (\S+)$/i.exec(req.get('authorization') || '');
  if (!credencial || !timingSafeEqual(hash(credencial[1]), hash(token))) {
    return res.set('WWW-Authenticate', 'Bearer').sendStatus(401);
  }

  res.set('Cache-Control', 'no-store');
  res.type(registro.contentType).send(await registro.metrics());
});

module.exports = router;
