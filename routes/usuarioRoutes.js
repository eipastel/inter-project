const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const path = require('path');

const router = express.Router();

// Rota para cadastrar novo usuário
router.post('/registrar', usuarioController.cadastrarUsuario);

// Rota para criar tabelas de usuários
router.post('/criar-tabelas', usuarioController.criarTabela);

// Rota para criar tabelas de usuários
router.post('/logar', usuarioController.logar);

// Rota para descobrir usuário logado
router.post('/usuarioLogado', usuarioController.descobrirUsuarioLogado);

// Rota para enviar notificação
router.post('/notificarUsuario', usuarioController.criarNotificacao);

// Rota para logar
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pagina-de-login.html'));
});

// Rota para cadastro
router.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'pagina-de-registro.html'));
});

// Rota para retornar todos os usuários
router.get('/pesquisarUsuarios', usuarioController.verTodosUsuarios);

// Rota para verificar notificacoes
router.get('/verificarNotificacoes/:idUsuarioLogado', usuarioController.verificarNotificacoes);

// Rota para ver todas as notificacoes
router.get('/verNotificacoes/:idUsuarioLogado', usuarioController.verNotificacoes);

// Rota para marcar notificação como lida
router.put('/marcarComoLida', usuarioController.marcarNotificacaoComoLida);

// Rota para atualizar o perfil
router.put('/atualizar-perfil', usuarioController.atualizarPerfil);


module.exports = router;