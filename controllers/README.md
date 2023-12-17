# Controllers - Documentação

Esta pasta contém os controladores (controllers) responsáveis por gerenciar as operações específicas relacionadas aos modelos do Inter Project. Cada controlador corresponde a um conjunto específico de ações e funcionalidades.

## atualizacaoController.js

Este controlador lida com as operações relacionadas às atualizações no sistema.

### Funções Exportadas:

1. **criarTabelas:**
   - Descrição: Cria as tabelas necessárias no banco de dados.
   - Método HTTP: POST
   - Rota: `/criar-tabelas`
   - Resposta: Retorna uma mensagem indicando o sucesso na criação da tabela.

2. **postar:**
   - Descrição: Permite aos usuários criar novas postagens.
   - Método HTTP: POST
   - Rota: `/postar`
   - Parâmetros: `mensagemNovaAtualizacao`, `idUsuario`, `criadoEm`
   - Resposta: Retorna uma mensagem indicando o sucesso na ação.

3. **carregarPostagens:**
   - Descrição: Obtém as postagens formatadas para exibição.
   - Método HTTP: GET
   - Rota: `/carregar-postagens`
   - Resposta: Retorna as postagens formatadas.


## comentarioController.js

Este controlador gerencia as operações relacionadas a comentários nas postagens.

### Funções Exportadas:

1. **criarTabela:**
   - Descrição: Cria a tabela necessária no banco de dados para armazenar comentários.
   - Método HTTP: POST
   - Rota: `/criar-tabela`
   - Resposta: Retorna uma mensagem indicando o sucesso na criação da tabela.

2. **comentarPostagem:**
   - Descrição: Permite aos usuários comentar em postagens existentes.
   - Método HTTP: POST
   - Rota: `/comentar-postagem`
   - Parâmetros: `idUsuario`, `idPostagem`, `comentario`
   - Resposta: Retorna uma mensagem indicando o sucesso na ação.

3. **comentariosDaPostagem:**
   - Descrição: Obtém os comentários de uma postagem específica.
   - Método: Função JavaScript
   - Parâmetros: `idPostagem`
   - Retorno: Retorna os comentários da postagem.

## perfilController.js

Este controlador gerencia as operações relacionadas ao perfil do usuário.

### Funções Exportadas:

1. **irParaPerfil:**
   - Descrição: Obtém informações do perfil e redireciona para a página de perfil.
   - Método HTTP: GET
   - Rota: `/perfil/:nomeUsuario`
   - Parâmetros: `nomeUsuario`
   - Resposta: Redireciona para a página de perfil.

2. **obterUsuario:**
   - Descrição: Obtém informações do perfil do usuário.
   - Método HTTP: GET
   - Rota: `/perfil-info/:nomeUsuario`
   - Parâmetros: `nomeUsuario`
   - Resposta: Retorna as informações do perfil.

## usuarioController.js

Este controlador gerencia as operações relacionadas aos usuários.

### Funções Exportadas:

1. **criarTabelas:**
   - Descrição: Cria a tabela necessária no banco de dados para armazenar informações do usuário.
   - Método HTTP: POST
   - Rota: `/criar-tabelas`
   - Resposta: Retorna uma mensagem indicando o sucesso na criação da tabela.

2. **cadastrarUsuario:**
   - Descrição: Permite aos usuários se cadastrar na plataforma.
   - Método HTTP: POST
   - Rota: `/registrar`
   - Parâmetros: `nome`, `usuario`, `email`, `senha`, `criadoEm`
   - Resposta: Retorna as informações do cadastro.

3. **logar:**
   - Descrição: Permite aos usuários fazerem login na plataforma.
   - Método HTTP: POST
   - Rota: `/logar`
   - Parâmetros: `email`, `senha`
   - Resposta: Retorna uma mensagem indicando o sucesso do login e um token de autenticação.

4. **descobrirUsuarioLogado:**
   - Descrição: Obtém informações sobre o usuário logado.
   - Método HTTP: GET
   - Rota: `/usuario-logado`
   - Parâmetros: Token de autenticação no cabeçalho da requisição.
   - Resposta: Retorna informações sobre o usuário logado.

---

Este documento fornece uma visão geral das funcionalidades específicas de cada controlador. Consulte os comentários no código-fonte para obter detalhes adicionais sobre cada função.

**Autor:**
Thiago Diogo - thiagodev.diogo@gmail.com - 17/12/2023