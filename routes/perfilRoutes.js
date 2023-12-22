const express = require('express');
const perfilController = require('../controllers/perfilController');

const router = express.Router();

// Rota para exibir o próprio perfil
router.get('/perfil', perfilController.meuPerfil);

// Defina a rota para obter informações detalhadas do usuário
router.get('/usuario/:idUsuarioLogado', perfilController.obterInformacoesUsuario);

module.exports = router;