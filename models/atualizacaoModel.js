const db = require('../config/dbConfig.js');
const comentarioController = require('../models/comentarioModel.js');

async function criarTabela() {
  try {
    await db`
      CREATE TABLE IF NOT EXISTS atualizacoes (
        id SERIAL PRIMARY KEY,
        id_usuario INT,
        mensagemNovaAtt VARCHAR(325),
        criadoEm VARCHAR(30),
        removidoEm VARCHAR(30),
        disponivel BOOLEAN NOT NULL DEFAULT true,
        editadoEm VARCHAR(30)
        );`;

        `CREATE TABLE IF NOT EXISTS curtidas (
          id SERIAL PRIMARY KEY,
          id_usuario INT,
          id_postagem INT,
          curtido_em VARCHAR(30)
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
          VALUES (${mensagemNovaAtualizacao}, ${idUsuario}, ${criadoEm});
        `;
    
        return { message: 'Ação realizada com sucesso!' };
      } catch (error) {
        console.error(error)
    }
}

// Model para curtir uma publicação
async function curtirPostagem({ idUsuario, idPostagem, curtidoEm }) {
  try {
    const verificarCurtida = await db`
      SELECT * FROM curtidas 
      WHERE id_usuario = ${idUsuario} AND id_postagem = ${idPostagem};
    `

    // Se o usuário não curtiu aquela publicação, adicionar a curtida
    if(verificarCurtida.length == 0) {
      await db`
        INSERT INTO curtidas (id_usuario, id_postagem, curtido_em)
        VALUES (${idUsuario}, ${idPostagem}, ${curtidoEm});
      `;
      return { message: 'Curtida adicionada com sucesso!' };

    } else {
        // Se ele já curtiu, remover a curtida
        await db`
          DELETE FROM curtidas 
          WHERE id_usuario = ${idUsuario} AND id_postagem = ${idPostagem};
        `;
        return { message: 'Curtida removida com sucesso!' };
      }

    } catch (error) {
      console.error(error)
  }
}

// Model para mostrar as postagens
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

async function verificarCurtida({ idUsuario, idPostagem }) {
    try {
    let curtidaFormatada = {}

    const curtidasDoUsuario = await db`
      SELECT * FROM curtidas WHERE id_usuario = ${idUsuario} AND id_postagem = ${idPostagem};
    `;

    const curtidasDoPost = await db`
      SELECT * FROM curtidas WHERE id_postagem = ${idPostagem};
    `;

    let quantidadeDeCurtidas = curtidasDoPost.length;

    if(curtidasDoUsuario.length <= 0) {
      curtidaFormatada = {
        curtido: false,
        quantidadeDeCurtidas: quantidadeDeCurtidas,
      }
    } else {
      curtidaFormatada = {
        curtido: true,
        idUsuario: idUsuario,
        idPostagem: idPostagem,
        idCurtida: curtidasDoUsuario.id,
        quantidadeDeCurtidas: quantidadeDeCurtidas,
      }
    }

    return curtidaFormatada;
  } catch(error) {
    throw error
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
