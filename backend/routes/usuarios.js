const express = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = express.Router();

router.get('/', usuarioController.listar);

router.post('/', usuarioController.crear);

router.put('/:id', usuarioController.actualizar);

router.patch('/:id/eliminar', usuarioController.eliminar);

router.patch('/:id/restaurar', usuarioController.restaurar);

module.exports = router;
