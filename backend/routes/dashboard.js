const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.use(require('../middleware/verifyPermiso')('ver-metricas'));

router.get('/', dashboardController.resumen);

module.exports = router;
