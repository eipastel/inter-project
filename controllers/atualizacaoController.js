const atualizacaoModel = require('../models/atualizacaoModel');

async function criarTabelas(req, res, next) {
    await atualizacaoModel.criarTabelas();
    res.json({ message: 'Tabela de atualizações criada com sucesso.' });
}

// Controller para postar
async function postar(req, res, next) {
    try {
        const { mensagemNovaAtualizacao, idUsuario, criadoEm } = req.body;
    
        const resultadoPostagem = await atualizacaoModel.postar({ mensagemNovaAtualizacao, idUsuario, criadoEm });

        if (resultadoPostagem.error) {
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }

        res.json({ message: 'Ação realizada com sucesso!' });
      } catch (error) {
        next(error);
    }
}

// Controller para ver postagens
async function carregarPostagens(req, res) {
    try {
        const postagensFormatadas = await atualizacaoModel.carregarPostagens();

        if(!postagensFormatadas) {
            // Tratando se não encontrar nenhuma postagem
            return
        }

        res.json({ postagensFormatadas });
    } catch(error) {
        console.error("Erro interno do servidor: ", error)
    }
}

module.exports = {
    // Funções exportadas:
    postar,
    carregarPostagens,

};
