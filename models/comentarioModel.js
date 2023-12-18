const db = require('../config/dbConfig.js');

async function criarTabela() {
  try {
    await db`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        id_usuario INT,
        id_postagem INT,
        comentario VARCHAR(60));`;
  } catch (error) {
    console.error('Erro ao criar tabela de atualizações: ', error.message);
  }
}


// Model da função para criar a postagem
async function comentarPostagem({ idUsuario, idPostagem, comentario }) {
    try {
        await db`
          INSERT INTO comentarios (id_usuario, id_postagem, comentario)
          VALUES (${idUsuario}, ${idPostagem}, ${comentario})
        `;
    
        return { message: 'Ação realizada com sucesso!' };
      } catch (error) {
        console.error(error)
    }
}

async function comentariosDaPostagem(idPostagem) {
  let comentarios = [];
  let comentario;

  const resultadoConsultaComentario = await db`
    SELECT * FROM comentarios
    WHERE id_postagem = ${idPostagem}
  `;

  for(let index = 0; index < resultadoConsultaComentario.length; index++) {
    const usuarioDoComentario = await db`
      SELECT * FROM usuarios
      WHERE id = ${resultadoConsultaComentario[index].id_usuario}
    `;

    comentario = {
      nomeUsuario: usuarioDoComentario[0].nome,
      comentario: resultadoConsultaComentario[index].comentario,
      idPostagem: idPostagem,
    }

    comentarios.push(comentario);
  }

  return comentarios;
}

module.exports = {
    // Funções exportadas:
    criarTabela,
    comentarPostagem,
    comentariosDaPostagem,

};
