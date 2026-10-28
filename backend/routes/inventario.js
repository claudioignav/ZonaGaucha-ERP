const express = require('express');
const inventarioController = require('../controllers/inventarioController');

const router = express.Router();

router.use(require('../middleware/verifyPermiso')('ver-inventario'));

router.get('/lotes', inventarioController.listarLotes);

router.get('/resumen', inventarioController.resumen);

module.exports = router;
