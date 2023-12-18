const express = require('express');
const atualizacaoController = require('../controllers/atualizacaoController');

const router = express.Router();

// Rota para postar
router.post('/postar', atualizacaoController.postar);

// Rota para mostrar postagens
router.get('/postagens', atualizacaoController.carregarPostagens);

// Rota para curtir postagem
router.post('/curtirPostagem', atualizacaoController.curtirPostagem);

// Rota para mostrar postagens
router.delete('/excluirPostagem/:idPostagem', atualizacaoController.excluirPostagem);

// Rota para verificar curtidas
router.get('/verificarCurtida/:idUsuario/:idPostagem', atualizacaoController.verificarCurtida);

module.exports = router;