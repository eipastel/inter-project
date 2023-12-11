const db = require('../config/dbConfig.js');

// Função para obter informações do perfil do usuário
async function obterPerfil(nomeUsuario) {
  try {
    const resultadoConsulta = await db`
      SELECT id, nome, usuario, bio, data_de_nascimento
      FROM usuarios
      WHERE usuario = ${nomeUsuario}
    `;

    const perfilUsuario = resultadoConsulta[0];

    if (!perfilUsuario) {
      return { error: 'USER_NOT_FOUND' };
    }

    // Converte o formato do perfil para um formato mais simples
    const perfilConvertido = {
      id: perfilUsuario.id,
      nome: perfilUsuario.nome,
      usuario: perfilUsuario.usuario,
      bio: perfilUsuario.bio,
      dataDeNascimento: perfilUsuario.data_de_nascimento
    };

    return perfilConvertido;
  } catch (error) {
    console.error('Erro ao obter perfil do usuário:', error.message);
    return { error: 'INTERNAL_SERVER_ERROR' };
  }
}

module.exports = {
  obterPerfil,
  
};