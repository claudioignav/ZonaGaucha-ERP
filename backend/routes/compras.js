const router = require('express').Router();

const compras = require('../controllers/compraController');
const verifyPermiso = require('../middleware/verifyPermiso');

router.use((req, res, next) => {
  const permiso = ['PUT', 'PATCH', 'DELETE'].includes(req.method)
    ? 'modificar-compra'
    : 'registrar-compra';
  return verifyPermiso(permiso)(req, res, next);
});

router.get('/opciones', require('../controllers/opcionesController').compras);

router.get('/resumen', verifyPermiso('ver-metricas'), compras.resumen);

router.get('/', compras.listar);

router.post('/', require('../middleware/resolverCompra'), compras.crear);

module.exports = router;
