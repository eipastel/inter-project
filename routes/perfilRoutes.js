const express = require('express');
const perfilController = require('../controllers/perfilController');

const router = express.Router();

// Rota para exibir redirecionar para o perfil específico
router.get('/perfil/:nomeUsuario', perfilController.irParaPerfil);

// Rota para exibir o perfil de usuário específico
router.get('/obterPerfil/:nomeUsuario', perfilController.obterUsuario);

module.exports = router;