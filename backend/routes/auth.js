const router = require('express').Router();

const controlador = require('../controllers/authController');

router.post('/login', controlador.login);

router.get('/perfil', require('../middleware/authenticateToken'), controlador.perfil);

module.exports = router;
