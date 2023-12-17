const express = require('express');
const comentarioController = require('../controllers/comentarioController');

const router = express.Router();

// Rota para comentar postagem
router.post('/comentarPostagem', comentarioController.comentarPostagem);

module.exports = router;