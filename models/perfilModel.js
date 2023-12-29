const db = require('../config/dbConfig.js');

// Função para conseguir as informações pelo "ID"
async function obterInformacoesUsuario(idUsuarioLogado) {
  try {
    let consultaUsuario = await db`
      WITH UsuarioInfo AS (
        SELECT
            usuarios.id AS id,
            usuarios.nome AS nome,
            usuarios.bio AS bio,
            usuarios.caminho_foto_perfil AS caminho_foto_perfil,
            usuarios.usuario AS usuario,
            usuarios.id_tipo_usuario AS id_tipo_usuario
        FROM usuarios
        WHERE usuarios.id = ${idUsuarioLogado}
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
          WHERE atualizacoes.id_usuario = ${idUsuarioLogado}
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
          JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT('id', Publicacoes.id, 'mensagemnovaatt', Publicacoes.mensagemnovaatt, 'criadoem', Publicacoes.criadoem, 'curtidas', Publicacoes.curtidas, 'comentarios', Publicacoes.comentarios)) AS publicacoes
      FROM UsuarioInfo
      LEFT JOIN Publicacoes ON true
      GROUP BY UsuarioInfo.id, UsuarioInfo.nome, UsuarioInfo.bio, UsuarioInfo.caminho_foto_perfil, UsuarioInfo.usuario, UsuarioInfo.id_tipo_usuario;
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
  obterInformacoesUsuario,
  obterInformacoesPeloUsuario,
  
};