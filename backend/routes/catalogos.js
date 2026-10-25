const express = require('express');
const catalogos = require('../controllers/catalogos');

const router = express.Router();

router.use(require('../middleware/verifyPermiso')('gestionar-catalogos'));

router.use(require('../middleware/resolverCatalogo'));

const rutasCatalogos = {
  'productos': catalogos.productos,
  'categorias-producto': catalogos.categorias,
  'proveedores': catalogos.proveedores,
  'tipos-pago': catalogos.tiposPago,
  'plataformas': catalogos.plataformas,
  'tipos-contenido': catalogos.tiposContenido,
};

Object.entries(rutasCatalogos).forEach(([ruta, controlador]) => {
  router.get(`/${ruta}`, controlador.listar);
  router.post(`/${ruta}`, controlador.crear);
  router.put(`/${ruta}/:id`, controlador.actualizar);
  router.delete(`/${ruta}/:id`, controlador.eliminar);
});

module.exports = router;
