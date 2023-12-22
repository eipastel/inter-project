const perfilModel = require('../models/perfilModel.js');
const path = require('path');

async function meuPerfil(req, res, next) {
    try {
        res.sendFile(path.join(__dirname, '../views/perfil.html'))
    } catch(error) {
        next(error);
    }
}

// Função para obter informações detalhadas do usuário
async function obterInformacoesUsuario(req, res, next) {
    try {
        const { idUsuarioLogado } = req.params;
        const informacoesUsuario = await perfilModel.obterInformacoesUsuario(idUsuarioLogado);

        if (!informacoesUsuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        res.json(informacoesUsuario);
    } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
        next(error);
    }
}

module.exports = {
    // Funções exportadas:
    meuPerfil,
    obterInformacoesUsuario,

    
};
