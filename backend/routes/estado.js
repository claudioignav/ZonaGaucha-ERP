const router = require('express').Router();

const { estado, estadoDespliegue } = require('../controllers/estadoController');

router.get('/', estado);
router.get('/estado/despliegue', estadoDespliegue);

module.exports = router;
