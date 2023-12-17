const comentarioModel = require('../models/comentarioModel');

async function criarTabela(req, res, next) {
    await comentarioModel.criarTabela();
    res.json({ message: 'Tabela de atualizações criada com sucesso.' });
}

// Controller para comentar publicação
async function comentarPostagem(req, res, next) {
    try {
        const { idUsuario, idPostagem, comentario } = req.body;
    
        const resultadoPostagemDoComentario = await comentarioModel.comentarPostagem({ idUsuario, idPostagem, comentario });

        if (resultadoPostagemDoComentario.error) {
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }

        res.json({ message: 'Ação realizada com sucesso!' });
      } catch (error) {
        next(error);
    }
}

async function comentariosDaPostagem(idPostagem) {
    return comentarios = await comentarioModel.comentariosDaPostagem(idPostagem);
}

module.exports = {
    // Funções exportadas:
    comentarPostagem,
    criarTabela,
    comentariosDaPostagem,

};
