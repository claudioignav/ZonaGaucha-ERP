const router = require('express').Router();

const ventas = require('../controllers/ventaController');
const verifyPermiso = require('../middleware/verifyPermiso');

router.use((req, res, next) => {
  const permiso = ['PUT', 'PATCH', 'DELETE'].includes(req.method)
    ? 'modificar-venta'
    : 'registrar-venta';
  return verifyPermiso(permiso)(req, res, next);
});

router.get('/opciones', require('../controllers/opcionesController').ventas);

router.get('/resumen', verifyPermiso('ver-metricas'), ventas.resumen);

router.get('/', ventas.listar);

router.post('/', require('../middleware/resolverVenta'), ventas.crear);

module.exports = router;
