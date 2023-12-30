const db = require('../config/dbConfig.js');

// Função para criar a tabela de seguidores caso não exista
async function criarTabela() {
  try {
    await db`
      CREATE TABLE IF NOT EXISTS seguidores (
        id SERIAL PRIMARY KEY,
        seguidor_id INT REFERENCES usuarios(id),
        seguido_id INT REFERENCES usuarios(id),
        data_seguindo VARCHAR(30)
      );`;
  } catch (error) {
    console.error('Erro ao criar tabela de seguidores: ', error.message);
  }
}

// Função para seguir ou deixar de seguir um usuário
async function seguirOuDeixarDeSeguir(segInfo) {
  try {
      // Verifica se o usuário já está seguindo o outro
      const resultadoConsulta = await db`
          SELECT id
          FROM seguidores
          WHERE seguidor_id = ${segInfo.idSeguidor} AND seguido_id = ${segInfo.idSeguido}
      `;
      
      if (resultadoConsulta.count > 0) {
          // Usuário já está seguindo, então remove o relacionamento
          await db`
              DELETE FROM seguidores
              WHERE seguidor_id = ${segInfo.idSeguidor} AND seguido_id = ${segInfo.idSeguido}
          `;
          return "unfollowed";
      } else {
          // Usuário não está seguindo, então adiciona o relacionamento
          await db`
              INSERT INTO seguidores (seguidor_id, seguido_id, data_seguindo)
              VALUES (${segInfo.idSeguidor}, ${segInfo.idSeguido}, ${segInfo.dataDeCriacao})
          `;
          return "followed";
      }
  } catch (error) {
      throw error;
  }
}

// Função para conseguir as informações pelo "ID"
async function obterInformacoesUsuario(idUsuario) {
  try {
    let consultaUsuario = await db`
    WITH UsuarioInfo AS (
      SELECT
          usuarios.id AS id,
          usuarios.nome AS nome,
          usuarios.bio AS bio,
          usuarios.caminho_foto_perfil AS caminho_foto_perfil,
          usuarios.usuario AS usuario,
          usuarios.id_tipo_usuario AS id_tipo_usuario,
          ARRAY(SELECT seguidor_id FROM seguidores WHERE seguido_id = usuarios.id) AS seguidores,
          ARRAY(SELECT seguido_id FROM seguidores WHERE seguidor_id = usuarios.id) AS seguindo
      FROM usuarios
      WHERE usuarios.id = ${idUsuario}
      LIMIT 1
    ),
    Publicacoes AS (
        SELECT
            atualizacoes.id AS id,
            atualizacoes.mensagemNovaAtt AS mensagemnovaatt,
            atualizacoes.criadoEm AS criadoem,
            JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', curtidas.id, 'idusuario', curtidas.id_usuario)) AS curtidas,
            JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', comentarios.id, 'nomeusuario', (SELECT nome FROM usuarios WHERE usuarios.id = comentarios.id_usuario LIMIT 1), 'comentario', comentarios.comentario)) AS comentarios
        FROM atualizacoes
        LEFT JOIN curtidas ON atualizacoes.id = curtidas.id_postagem
        LEFT JOIN comentarios ON atualizacoes.id = comentarios.id_postagem
        WHERE atualizacoes.id_usuario = ${idUsuario}
        AND atualizacoes.disponivel = true
        GROUP BY atualizacoes.id, atualizacoes.mensagemNovaAtt, atualizacoes.criadoEm
    )
    SELECT
        UsuarioInfo.id AS id,
        UsuarioInfo.nome AS nome,
        UsuarioInfo.bio AS bio,
        UsuarioInfo.caminho_foto_perfil AS caminho_foto_perfil,
        UsuarioInfo.usuario AS usuario,
        UsuarioInfo.id_tipo_usuario AS id_tipo_usuario,
        UsuarioInfo.seguidores AS seguidores,
        UsuarioInfo.seguindo AS seguindo,
        JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', Publicacoes.id, 'mensagemnovaatt', Publicacoes.mensagemnovaatt, 'criadoem', Publicacoes.criadoem, 'curtidas', Publicacoes.curtidas, 'comentarios', Publicacoes.comentarios)) AS publicacoes
    FROM UsuarioInfo
    LEFT JOIN Publicacoes ON true
    GROUP BY UsuarioInfo.id, UsuarioInfo.nome, UsuarioInfo.bio, UsuarioInfo.caminho_foto_perfil, UsuarioInfo.usuario, UsuarioInfo.id_tipo_usuario, UsuarioInfo.seguidores, UsuarioInfo.seguindo;

    `;
    return consultaUsuario;
  } catch(error) {
    throw error;
  }
}

// Função para conseguir as informações pelo "ID"
async function obterInformacoesPeloUsuario(usuario) {
  try {
    let idUsuario = await db`
      SELECT id FROM usuarios
      WHERE usuario = ${usuario};
    `;
    return await obterInformacoesUsuario(idUsuario[0].id);
  } catch(error) {
    throw error
  }
}
module.exports = {
  criarTabela,
  obterInformacoesUsuario,
  obterInformacoesPeloUsuario,
  seguirOuDeixarDeSeguir,
  
};