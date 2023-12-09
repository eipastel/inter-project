const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig.js');
const dotenv = require('dotenv');

dotenv.config();

const TOKEN_KEY = process.env.TOKEN_KEY;

async function criarTabelas() {
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
          senha VARCHAR(255),
          id_tipo_usuario INT DEFAULT 2
        );
      `;
    } catch (error) {
      console.error('Erro ao criar tabela de usuários: ', error.message);
    }
}

// Função para cadastrar novo usuário
async function cadastrarUsuario({ nome, usuario, email, senha }) {
  try {
    // Verifica se usuário ou email já existem
    const resultadoConsulta = await db`
      SELECT * FROM usuarios WHERE usuario = ${usuario} OR email = ${email}
    `;

    if (resultadoConsulta.length) {
      return { error: 'USER_ALREADY_EXISTS' };
    }

    // Gera token JWT e hash da senha
    const token = jwt.sign({ email }, process.env.TOKEN_KEY, { expiresIn: '1h' });
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Insere novo usuário no banco de dados
    await db`
      INSERT INTO usuarios (nome, usuario, email, senha, token)
      VALUES (${nome}, ${usuario}, ${email}, ${senhaCriptografada}, ${token})
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

    console.log('Novo Token:', token);

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
      SELECT id, nome, email, usuario, bio, id_tipo_usuario
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
      bio: usuarioLogado.bio
    };

    return usuarioConvertido;

  } catch(error) {
    console.error(error);
  }
}

module.exports = {
    // Funções exportadas:
    cadastrarUsuario,
    criarTabelas,
    logar,
    descobrirUsuarioLogado,

};
