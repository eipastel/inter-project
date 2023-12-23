const atualizacaoModel = require('../models/atualizacaoModel');

async function criarTabela(req, res, next) {
    await atualizacaoModel.criarTabela();
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
        // Recebe o número da página atual a partir dos parâmetros da solicitação (por padrão é a página 1)
        const paginaAtual = req.query.pagina || 1;
        const postagensPorPagina = 8;

        // Calcule o offset com base no número da página
        const offset = Math.max(0, (paginaAtual - 1) * postagensPorPagina);

        const postagensFormatadas = await atualizacaoModel.carregarPostagens(offset);

        if (!postagensFormatadas) {
            // Tratando se não encontrar nenhuma postagem
            return res.status(404).json({ mensagem: 'Nenhuma postagem encontrada.' });
        }

        res.json({ postagensFormatadas });
    } catch (error) {
        console.error("Erro interno do servidor: ", error);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
}

// Controller para excluir postagem
async function excluirPostagem(req, res) {
    try {
        const { idPostagem } = req.params;

        const respostaExclusao = await atualizacaoModel.excluirPostagem(idPostagem);

        res.json({ respostaExclusao });
    } catch(error) {
        console.error("Erro interno do servidor:", error)
    }
}

// Controller para curtir publicação
async function curtirPostagem(req, res) {
    try {
        const { idUsuario, idPostagem, curtidoEm } = req.body;

        const resultadoCurtida = await atualizacaoModel.curtirPostagem({ idUsuario, idPostagem, curtidoEm });

        res.json({ resultadoCurtida });
    } catch(error) {
        console.error("Erro interno do servidor:", error)
    }
}

async function verificarCurtida(req, res){
    try {
        const { idUsuario, idPostagem } = req.params;

        const usuarioCurtiu = await atualizacaoModel.verificarCurtida({ idUsuario, idPostagem });

        res.json( usuarioCurtiu );
    } catch (error) {
        console.error('Erro ao verificar curtida:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

module.exports = {
    // Funções exportadas:
    criarTabela,
    postar,
    carregarPostagens,
    excluirPostagem,
    curtirPostagem,
    verificarCurtida,

};
