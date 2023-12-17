# Models - Documentação

Esta pasta contém os modelos (models) responsáveis pela interação com o banco de dados e a manipulação dos dados no Inter Project. Cada modelo corresponde a uma entidade específica no sistema.

## atualizacaoModel.js

Este modelo lida com as operações relacionadas às atualizações no sistema.

### Funções Exportadas:

1. **criarTabelas:**
   - Descrição: Cria a tabela necessária no banco de dados para armazenar atualizações.
   - Método: Função JavaScript
   - Retorno: Retorna uma mensagem indicando o sucesso na criação da tabela.

2. **postar:**
   - Descrição: Permite aos usuários criar novas postagens.
   - Método: Função JavaScript
   - Parâmetros: `mensagemNovaAtualizacao`, `idUsuario`, `criadoEm`
   - Retorno: Retorna uma mensagem indicando o sucesso na ação.

3. **carregarPostagens:**
   - Descrição: Obtém as postagens formatadas para exibição.
   - Método: Função JavaScript
   - Retorno: Retorna as postagens formatadas.

## comentarioModel.js

Este modelo gerencia as operações relacionadas a comentários nas postagens.

### Funções Exportadas:

1. **criarTabela:**
   - Descrição: Cria a tabela necessária no banco de dados para armazenar comentários.
   - Método: Função JavaScript
   - Retorno: Retorna uma mensagem indicando o sucesso na criação da tabela.

2. **comentarPostagem:**
   - Descrição: Permite aos usuários comentar em postagens existentes.
   - Método: Função JavaScript
   - Parâmetros: `idUsuario`, `idPostagem`, `comentario`
   - Retorno: Retorna uma mensagem indicando o sucesso na ação.

3. **comentariosDaPostagem:**
   - Descrição: Obtém os comentários de uma postagem específica.
   - Método: Função JavaScript
   - Parâmetros: `idPostagem`
   - Retorno: Retorna os comentários da postagem.

## perfilModel.js

Este modelo gerencia as operações relacionadas ao perfil do usuário.

### Funções Exportadas:

1. **obterPerfil:**
   - Descrição: Obtém informações do perfil do usuário.
   - Método: Função JavaScript
   - Parâmetros: `nomeUsuario`
   - Retorno: Retorna as informações do perfil.

## usuarioModel.js

Este modelo gerencia as operações relacionadas aos usuários.

### Funções Exportadas:

1. **criarTabelas:**
   - Descrição: Cria a tabela necessária no banco de dados para armazenar informações do usuário.
   - Método: Função JavaScript
   - Retorno: Retorna uma mensagem indicando o sucesso na criação da tabela.

2. **cadastrarUsuario:**
   - Descrição: Permite aos usuários se cadastrar na plataforma.
   - Método: Função JavaScript
   - Parâmetros: `nome`, `usuario`, `email`, `senha`, `criadoEm`
   - Retorno: Retorna as informações do cadastro.

3. **logar:**
   - Descrição: Permite aos usuários fazerem login na plataforma.
   - Método: Função JavaScript
   - Parâmetros: `email`, `senha`
   - Retorno: Retorna uma mensagem indicando o sucesso do login e um token de autenticação.

4. **descobrirUsuarioLogado:**
   - Descrição: Obtém informações sobre o usuário logado.
   - Método: Função JavaScript
   - Parâmetros: Token de autenticação no cabeçalho da requisição.
   - Retorno: Retorna informações sobre o usuário logado.

## usuarioModel.js

Este modelo gerencia as operações relacionadas aos usuários.

### Funções Exportadas:

1. **criarTabelas:**
   - Descrição: Cria a tabela necessária no banco de dados para armazenar informações do usuário.
   - Método: Função JavaScript
   - Retorno: Retorna uma mensagem indicando o sucesso na criação da tabela.

2. **cadastrarUsuario:**
   - Descrição: Permite aos usuários se cadastrar na plataforma.
   - Método: Função JavaScript
   - Parâmetros: `nome`, `usuario`, `email`, `senha`, `criadoEm`
   - Retorno: Retorna as informações do cadastro.

3. **logar:**
   - Descrição: Permite aos usuários fazerem login na plataforma.
   - Método: Função JavaScript
   - Parâmetros: `email`, `senha`
   - Retorno: Retorna uma mensagem indicando o sucesso do login e um token de autenticação.

4. **descobrirUsuarioLogado:**
   - Descrição: Obtém informações sobre o usuário logado.
   - Método: Função JavaScript
   - Parâmetros: Token de autenticação no cabeçalho da requisição.
   - Retorno: Retorna informações sobre o usuário logado.

### Dependências:

- bcrypt
- jwt
- dotenv
- dbConfig.js

---

Este documento fornece uma visão geral das funções específicas de cada modelo. Consulte os comentários no código-fonte para obter detalhes adicionais sobre cada função.

**Autor:**
Thiago Diogo - thiagodev.diogo@gmail.com - 17/12/2023