const express = require('express');
const perfilController = require('../controllers/perfilController');

const router = express.Router();

// Rota para exibir o próprio perfil
router.get('/perfil', perfilController.meuPerfil);

// Define a rota para obter informações detalhadas do usuário pelo "id"
router.get('/usuario/:idUsuarioLogado', perfilController.obterInformacoesUsuario);

// Rota para seguir ou deixar de seguir usuário
router.post('/seguirOuDeixarDeSeguir', perfilController.seguirOuDeixarDeSeguir);

// Define a rota para obter informações detalhadas do usuário pelo "usuário"
router.get('/usuarioperfil/:usuario', perfilController.obterInformacoesPeloUsuario);

// Rota do perfil para aceitar o usuario como parametro
router.get('/perfil/:usuario', perfilController.perfilUsuario);

module.exports = router;