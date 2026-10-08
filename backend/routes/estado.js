const router = require('express').Router();

const { estado } = require('../controllers/estadoController');

router.get('/', estado);

module.exports = router;
