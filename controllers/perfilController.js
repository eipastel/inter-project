const perfilModel = require('../models/perfilModel.js');
const path = require('path');

// Função para renderizar o perfil
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

// Função para seguir ou deixar de seguir um usuário
async function seguirOuDeixarDeSeguir(req, res, next) {
    try {
        const { idSeguidor, idSeguido, dataDeCriacao } = req.body;
        const segInfo = {
            idSeguidor,
            idSeguido,
            dataDeCriacao
        }

        // Verifica se o usuário já está seguindo o outro
        const resultadoConsulta = await perfilModel.seguirOuDeixarDeSeguir(segInfo);

        if (resultadoConsulta === "unfollowed") {
            res.status(200).json({ message: "Deixou de seguir o usuário", status: "deixou de seguir" });
        } else if (resultadoConsulta === "followed") {
            res.status(200).json({ message: "Seguiu o usuário", status: "começou a seguir" });
        } else {
            res.status(400).json({ message: "A operação não pôde ser concluída", status: "error" });
        }

    } catch (error) {
        next(error);
    }
}

// Função para obter informações detalhadas do usuário
async function obterInformacoesPeloUsuario(req, res, next) {
    try {
        const { usuario } = req.params;
        const informacoesUsuario = await perfilModel.obterInformacoesPeloUsuario(usuario);

        if (!informacoesUsuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        res.json(informacoesUsuario);
    } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
        next(error);
    }
}

// Modifique o controlador para obter informações do perfil do usuário especificado
async function perfilUsuario(req, res) {
    try {
        res.sendFile(path.join(__dirname, '../views/perfil.html'))
    } catch (error) {
        throw error
    }
}

module.exports = {
    // Funções exportadas:
    meuPerfil,
    obterInformacoesUsuario,
    perfilUsuario,
    obterInformacoesPeloUsuario,
    seguirOuDeixarDeSeguir,
    
};
