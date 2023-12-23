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
        );
        
        CREATE TABLE IF NOT EXISTS curtidas (
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
async function carregarPostagens(offset) {
  try {
    const limit = 8;
    // Consulta principal
    let postagensFormatadas = await db`
      SELECT
      atualizacoes.id AS id,
      atualizacoes.mensagemNovaAtt AS mensagemnovaatt,
      usuarios.usuario AS usuario,
      (
          SELECT nome
          FROM usuarios
          WHERE usuarios.id = atualizacoes.id_usuario
          LIMIT 1
      ) AS nomeusuario,
      atualizacoes.criadoEm AS criadoem,
      ARRAY_AGG(DISTINCT (
          SELECT JSON_BUILD_OBJECT('id', curtidas.id, 'idusuario', curtidas.id_usuario)::TEXT
      )) AS curtidas,
      ARRAY_AGG(DISTINCT (
          SELECT JSON_BUILD_OBJECT('id', comentarios.id, 'nomeusuario', (SELECT nome FROM usuarios WHERE usuarios.id = comentarios.id_usuario LIMIT 1), 'comentario', comentarios.comentario)::TEXT
      )) AS comentarios
      FROM atualizacoes
      LEFT JOIN usuarios ON atualizacoes.id_usuario = usuarios.id
      LEFT JOIN curtidas ON atualizacoes.id = curtidas.id_postagem
      LEFT JOIN comentarios ON atualizacoes.id = comentarios.id_postagem
      GROUP BY atualizacoes.id, nomeusuario, usuarios.usuario
      ORDER BY atualizacoes.id DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    if (!postagensFormatadas || postagensFormatadas.length === 0) {
      // Tratando se não encontrar nenhuma publicação
      return { postagensFormatadas: null, maisPostagensDisponiveis: false };
    }

    postagensFormatadas.forEach(postagem => {
      postagem.curtidas = postagem.curtidas.map(jsonString => JSON.parse(jsonString));
      postagem.comentarios = postagem.comentarios.map(jsonString => JSON.parse(jsonString));
    });

    return { postagensFormatadas, maisPostagensDisponiveis: true };
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
    criarTabela,
    postar,
    carregarPostagens,
    excluirPostagem,
    curtirPostagem,

};
