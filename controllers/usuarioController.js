const usuarioModel = require('../models/usuarioModel.js');

async function criarTabela(req, res, next) {
  await usuarioModel.criarTabela();
  res.json({ message: 'Tabela de usuários criada com sucesso.' });
}

// Função para cadastrar novo usuário
async function cadastrarUsuario(req, res, next) {
  try {
    const { nome, usuario, email, senha, criadoEm } = req.body;
    const resultadoCadastro = await usuarioModel.cadastrarUsuario({ nome, usuario, email, senha, criadoEm });

    if (resultadoCadastro.error) {
      return res.status(409).json({ error: resultadoCadastro.error });
    }

    res.json(resultadoCadastro);
  } catch (error) {
    next(error);
  }
}

// Controlador para notificar usuário
async function criarNotificacao(req, res, next) {
  try {
    const { idUsuarioAcao, idUsuarioNotificado, idAcao, idTipoAcao, criadoEm } = req.body;

    const resultadoCriacao = await usuarioModel.criarNotificacao({ idUsuarioAcao, idUsuarioNotificado, idAcao, idTipoAcao, criadoEm });

    res.json(resultadoCriacao);
  } catch(error) {
    next(error)
  }
}

// Função para verificar notificações do usuário logado
async function verificarNotificacoes(req, res, next) {
  try {
    const { idUsuarioLogado } = req.params;

    const resultadoConsulta = await usuarioModel.verificarNotificacoes(idUsuarioLogado);


    res.json(resultadoConsulta);
  } catch(error) {
    next(error)
  }
}

// Controlador para ver todos os usuários
async function verTodosUsuarios(req, res, next) {
  try {
    const resultadoConsulta = await usuarioModel.verTodosUsuarios();
    res.json(resultadoConsulta);
  } catch(error) {
    next(error)
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

// Função para descobrir usuário logado
async function descobrirUsuarioLogado(req, res) {
  try {
    const token = req.headers.authorization;

    const usuarioLogado = await usuarioModel.descobrirUsuarioLogado(token);

    if (!usuarioLogado || !usuarioLogado.nome) {
    }

    // Retornar a informação
    return res.status(200).json(usuarioLogado);

  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Função para atualizar as informações do perfil
async function atualizarPerfil(req, res, next) {
  try {
    const { id, caminhoFotoPerfil, nome, bio, usuario } = req.body;
    const resultadoAtualizacao = await usuarioModel.atualizarPerfil({ id, caminhoFotoPerfil, nome, bio, usuario });

    res.json(resultadoAtualizacao);
  } catch (error) {
    next(error);
  }
}

module.exports = {
    // Funções exportadas:
    criarTabela,
    cadastrarUsuario,
    logar,
    descobrirUsuarioLogado,
    atualizarPerfil,
    verTodosUsuarios,
    criarNotificacao,
    verificarNotificacoes,

};
