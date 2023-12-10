const usuarioModel = require('../models/usuarioModel.js');

async function criarTabelas(req, res, next) {
  await usuarioModel.criarTabelas();
  res.json({ message: 'Tabela de usuários criada com sucesso.' });
}

// Função para cadastrar novo usuário
async function cadastrarUsuario(req, res, next) {
  try {
    const { nome, usuario, email, senha } = req.body;
    const resultadoCadastro = await usuarioModel.cadastrarUsuario({ nome, usuario, email, senha });

    if (resultadoCadastro.error) {
      return res.status(409).json({ error: resultadoCadastro.error });
    }

    res.json(resultadoCadastro);
  } catch (error) {
    next(error);
  }
}

// Controlador para rota de login
async function logar(req, res) {
  try {
    const { email, senha } = req.body;

    const resultadoLogin = await usuarioModel.logar({ email, senha });

    if (resultadoLogin.error) {
      // Lida com erros de login
      if (resultadoLogin.error === 'USER_NOT_FOUND') {
        return res.status(401).json({ error: 'USER_NOT_FOUND' });
      } else if (resultadoLogin.error === 'INVALID_PASSWORD') {
        return res.status(401).json({ error: 'INVALID_PASSWORD' });
      } else {
        return res.status(500).json({ error: 'Erro interno do servidor.' });
      }
    }

    // Se não houver erros, retorna uma resposta de sucesso
    res.json({ message: resultadoLogin.message, token: resultadoLogin.token });
  } catch (error) {
    console.error('Erro ao processar login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

async function descobrirUsuarioLogado(req, res) {
  try {
    const token = req.headers.authorization;

    const usuarioLogado = await usuarioModel.descobrirUsuarioLogado(token);

    if (!usuarioLogado || !usuarioLogado.nome) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    // Retornar a informação
    return res.status(200).json(usuarioLogado);

  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = {
    // Funções exportadas:
    cadastrarUsuario,
    criarTabelas,
    logar,
    descobrirUsuarioLogado,

};
