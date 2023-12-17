const db = require('../config/dbConfig.js');
const comentarioController = require('../models/comentarioModel.js');

async function criarTabelas() {
  try {
    await db`
      CREATE TABLE IF NOT EXISTS atualizacoes (
        id SERIAL PRIMARY KEY,
        id_usuario INT,
        mensagemNovaAtt VARCHAR(325),
        curtidas INT,
        comentarios VARCHAR(125),
        criadoEm VARCHAR(30),
        removidoEm VARCHAR(30),
        disponivel BOOLEAN NOT NULL DEFAULT true,
        editadoEm VARCHAR(30)
        );`;
  } catch (error) {
    console.error('Erro ao criar tabela de atualizações: ', error.message);
  }
}

// Model da função para criar a postagem
async function postar({ mensagemNovaAtualizacao, idUsuario, criadoEm }) {
    try {
        await db`
          INSERT INTO atualizacoes (mensagemNovaAtt, id_usuario, criadoEm)
          VALUES (${mensagemNovaAtualizacao}, ${idUsuario}, ${criadoEm})
        `;
    
        return { message: 'Ação realizada com sucesso!' };
      } catch (error) {
        console.error(error)
    }
}

async function carregarPostagens() {
  try {
    let postagensFormatadas = []
    let postagem;

    let todasPostagens = await db`
      SELECT * FROM atualizacoes
      ORDER BY id ASC;
    `;

    if (!todasPostagens || todasPostagens.length === 0) {
      // Tratando se não encontrar nenhuma publicação
      return null;
    }

    for(let index = 0; index < todasPostagens.length; index++) {
      let usuarioDaPostagem = await db`
      SELECT * FROM usuarios WHERE id = ${todasPostagens[index].id_usuario};
      `
      
      let todosOsComentariosDaPostagem = await comentarioController.comentariosDaPostagem(todasPostagens[index].id);

      postagem = {
        id: todasPostagens[index].id,
        nomeUsuario: usuarioDaPostagem[0].nome,
        usuario: usuarioDaPostagem[0].usuario,
        comentarios: todosOsComentariosDaPostagem,
        mensagemnovaatt: todasPostagens[index].mensagemnovaatt,
        criadoem: todasPostagens[index].criadoem,
        idUsuario: todasPostagens[index].id_usuario
      };

      postagensFormatadas.push(postagem);
    }

    return postagensFormatadas
    } catch (error) { 
      throw error;
  }
}

async function excluirPostagem(idPostagem) {
  try {

    let statusRemocao = await db`
      DELETE FROM atualizacoes
      WHERE id = ${idPostagem};
    `;

    return statusRemocao
  } catch(error) {
    throw error;
  }
}

module.exports = {
    // Funções exportadas:
    criarTabelas,
    postar,
    carregarPostagens,
    excluirPostagem,

};
