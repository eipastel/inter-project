const express = require('express');
const atualizacaoController = require('../controllers/atualizacaoController');

const router = express.Router();

// Rota para postar
router.post('/postar', atualizacaoController.postar);

// Rota para mostrar postagens
router.get('/postagens', atualizacaoController.carregarPostagens);

// Rota para curtir postagem
router.post('/curtirPostagem', atualizacaoController.curtirPostagem);

// Rota para editar postagem
router.put('/editarPostagem', atualizacaoController.editarPostagem);

// Rota para excluir postagem
router.put('/excluirPostagem', atualizacaoController.excluirPostagem);

// Rota para verificar curtidas
router.get('/verificarCurtida/:idUsuario/:idPostagem', atualizacaoController.verificarCurtida);

// Rota para ver uma atualização
router.get('/verPostagem/:idPostagem', atualizacaoController.verPostagem);

module.exports = router;