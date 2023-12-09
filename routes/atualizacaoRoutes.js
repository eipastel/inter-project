const express = require('express');
const atualizacaoController = require('../controllers/atualizacaoController');

const router = express.Router();

// Rota para postar
router.post('/postar', atualizacaoController.postar);

// Rota para mostrar postagens
router.get('/postagens', atualizacaoController.carregarPostagens);

module.exports = router;