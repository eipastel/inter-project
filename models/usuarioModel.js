const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig.js');
const dotenv = require('dotenv');
dotenv.config();
const TOKEN_KEY = process.env.TOKEN_KEY;

async function criarTabela() {
    try {
      await db`
        CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          token VARCHAR(255),
          nome VARCHAR(255),
          bio VARCHAR(200),
          data_de_nascimento VARCHAR(10),
          usuario VARCHAR(50),
          email VARCHAR(255),
          caminho_foto_perfil VARCHAR(255),
          criadoEm VARCHAR(30),
          senha VARCHAR(255),
          id_tipo_usuario INT DEFAULT 2
        );
        
        CREATE TABLE IF NOT EXISTS notificacoes (
          id SERIAL PRIMARY KEY,
          id_usuario_acao INT,
          id_usuario_notificado INT,
          id_acao INT,
          id_tipo_acao INT,
          status BOOLEAN NOT NULL DEFAULT false,
          criadoEm VARCHAR(30)
        );`;
    } catch (error) {
      console.error('Erro ao criar tabela de usuários: ', error.message);
    }
}

// Função para criar notificação
async function criarNotificacao({ idUsuarioAcao, idUsuarioNotificado, idAcao, idTipoAcao, criadoEm }) {
  try{
    const resultadoConsulta = await db`
      INSERT INTO notificacoes (id_usuario_acao, id_usuario_notificado, id_acao, id_tipo_acao, criadoEm)
      VALUES (${idUsuarioAcao}, ${idUsuarioNotificado}, ${idAcao}, ${idTipoAcao}, ${criadoEm})
      ON CONFLICT ON CONSTRAINT uq_notificacoes_hash_combinado
      DO NOTHING;
      `;

    return resultadoConsulta;
  } catch(error) {
    console.error(error)
  }
}

// Função para verificar notificação
async function verificarNotificacoes(idUsuarioLogado) {
  try{
    const resultadoConsulta = await db`
      SELECT * FROM notificacoes
      WHERE id_usuario_notificado = ${idUsuarioLogado} AND status = false;
    `;

    return resultadoConsulta;
  } catch(error) {
    console.error("Erro na verificação de notificação:", error)
  }
}

// Função para ver todos os usuários (que sejam administradores ou verificados)
async function verTodosUsuarios(){
  try{

    const resultadoConsulta = await db`
      SELECT id, nome, usuario, caminho_foto_perfil FROM usuarios
      WHERE id_tipo_usuario in (1, 3);
    `;

    return resultadoConsulta
  } catch(error) {
    throw error;
  }
}

// Função para cadastrar novo usuário
async function cadastrarUsuario({ nome, usuario, email, senha, criadoEm }) {
  try {
    // Verifica se usuário ou email já existem
    const resultadoConsulta = await db`
      SELECT * FROM usuarios WHERE usuario = ${usuario} OR email = ${email}
    `;

    if(resultadoConsulta.length) {
      return { error: 'USER_ALREADY_EXISTS' };
    }

    // Gera token JWT e hash da senha
    const token = jwt.sign({ email }, process.env.TOKEN_KEY, { expiresIn: '1h' });
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Insere novo usuário no banco de dados
    await db`
      INSERT INTO usuarios (nome, usuario, email, criadoEm, senha, token)
      VALUES (${nome}, ${usuario}, ${email}, ${criadoEm}, ${senhaCriptografada}, ${token})
    `;

    return { message: 'Usuário cadastrado com sucesso!', token };
  } catch (error) {
    throw error;
  }
}

// Função para logar usuário
async function logar({ email, senha }) {
  try {
    // Verifica se email existe
    const resultadoConsulta = await db`
      SELECT * FROM usuarios WHERE email = ${email}
    `;

    const usuario = resultadoConsulta[0];

    if (!usuario) {
      return { error: 'USER_NOT_FOUND' };
    }

    // Verifica a senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return { error: 'INVALID_PASSWORD' };
    }

    // Gera novo token JWT e atualiza no banco de dados
    const token = jwt.sign({ email }, TOKEN_KEY, { expiresIn: '1h' });

    const resultadoAttBanco = await db`
      UPDATE usuarios SET token = ${token} WHERE id = ${usuario.id}
    `;

    return { message: 'Login realizado com sucesso!', token };
  } catch (error) {
    return { error: 'INTERNAL_SERVER_ERROR' };
  }
}

// Rota para descobrir usuário logado
async function descobrirUsuarioLogado(theToken) {

  try {
    const token = theToken;

    if (!token) {
      return { error: 'TOKEN_NOT_PROVIDED' };
    }

    // Consulta informações do usuário pelo token
    const resultadoConsulta = await db`
      SELECT id, nome, email, usuario, bio, id_tipo_usuario, caminho_foto_perfil
      FROM usuarios
      WHERE token = ${token}
    `;

    const usuarioLogado = resultadoConsulta[0];

    if (!usuarioLogado) {
      return { error: 'USER_NOT_FOUND' };
    }

    // Converte o formato do usuário para um formato mais simples
    const usuarioConvertido = {
      id: usuarioLogado.id,
      tipoUsuario: usuarioLogado.id_tipo_usuario,
      nome: usuarioLogado.nome,
      email: usuarioLogado.email,
      usuario: usuarioLogado.usuario,
      bio: usuarioLogado.bio,
      caminho_foto_perfil: usuarioLogado.caminho_foto_perfil
    };

    return usuarioConvertido;

  } catch(error) {
    throw error
  }
}

// Função para atualizar as informações do perfil
async function atualizarPerfil({ id, caminhoFotoPerfil = '', nome, bio = '', usuario }) {
  try {
    await db`
      UPDATE usuarios
      SET caminho_foto_perfil = ${caminhoFotoPerfil}, nome = ${nome}, bio = ${bio}, usuario = ${usuario}
      WHERE id = ${id};
    `;
    return { message: 'Perfil atualizado com sucesso!' };
  } catch (error) {
    throw error;
  }
}

module.exports = {
    // Funções exportadas:
    cadastrarUsuario,
    criarTabela,
    logar,
    descobrirUsuarioLogado,
    atualizarPerfil,
    verTodosUsuarios,
    criarNotificacao,
    verificarNotificacoes,

};
