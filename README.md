# Inter Project - Documentação

Este é o guia completo para o Inter Project, uma aplicação web para postagens de atualizações e interações entre usuários. A aplicação utiliza uma arquitetura MVC (Model-View-Controller) para organizar seu código de maneira eficiente.

## Índice
1. [**Introdução**](#introdução)
2. [**Tecnologias Utilizadas**](#tecnologias-utilizadas)
3. [**Configuração do Ambiente**](#configuração-do-ambiente)
4. [**Estrutura do Projeto**](#estrutura-do-projeto)
5. [**Modelos (Models)**](#modelos)
   - [Usuário](#usuário)
   - [Atualização](#atualização)
6. [**Controladores (Controllers)**](#controladores)
   - [Usuário Controller](#usuário-controller)
   - [Atualização Controller](#atualização-controller)
7. [**Rotas**](#rotas)
8. [**Frontend**](#frontend)
9. [**Deploy**](#deploy)
10. [**Conclusão**](#conclusão)
11. [**Futuras Features**](#futuras-features)

## 1. Introdução

O Sistema de Atualizações é uma plataforma onde os usuários podem postar atualizações e interagir entre si por meio de comentários. A aplicação segue o modelo MVC, facilitando a manutenção e escalabilidade.

## 2. Tecnologias Utilizadas

- Node.js
- Express.js
- PostgreSQL
- Bcrypt
- JWT (JSON Web Token)
- HTML, CSS, JavaScript (para o frontend)

## 3. Configuração do Ambiente

1. **Instalação do Node.js e npm:**
   Certifique-se de ter o Node.js e o npm instalados em seu ambiente. Você pode baixá-los [aqui](https://nodejs.org/).

2. **Configuração do Banco de Dados:**
   - Instale o PostgreSQL e crie um banco de dados para a aplicação.
   - Configure as variáveis de ambiente no arquivo `.env` para armazenar as informações sensíveis.

3. **Instalação de Dependências:**
   Execute `npm install` no terminal para instalar todas as dependências necessárias.

4. **Inicialização do Servidor:**
   Execute `npm start` para iniciar o servidor da aplicação.

## 4. Estrutura do Projeto

A estrutura do projeto segue o modelo MVC, organizando o código de forma clara e modular. As pastas principais são:

- **config:** Configurações do banco de dados e outras configurações do sistema.
- **controllers:** Controladores para lidar com as requisições HTTP.
- **models:** Modelos para interação com o banco de dados.
- **public:** Arquivos estáticos como CSS, imagens, etc.
- **routes:** Rotas da aplicação.
- **views:** Arquivos HTML para renderização das páginas.

## 5. Modelos

### Usuário

O modelo de usuário é responsável pelo gerenciamento de dados relacionados aos usuários da aplicação.

Campos:
- `id`: Identificador único do usuário.
- `nome`: Nome do usuário.
- `usuario`: Nome de usuário único.
- `email`: Endereço de e-mail único.
- `senha`: Senha criptografada do usuário.
- `token`: Token JWT para autenticação.
- `id_tipo_usuario`: Identificador do tipo de usuário.

### Atualização

O modelo de atualização gerencia as postagens de atualizações feitas pelos usuários.

Campos:
- `id`: Identificador único da atualização.
- `mensagemNovaAtt`: Mensagem da atualização.
- `id_usuario`: Identificador do usuário que fez a atualização.
- `criadoEm`: Data e hora de criação da atualização.
- `removidoEm`: Data e hora da remoção da atualização.
- `editadoEm`: Data e hora da edição da atualização.
- `curtidas`: Quantidade de curtidas da atualização.

## 6. Controladores

### Usuário Controller

Este controlador gerencia as operações relacionadas aos usuários, como cadastro, login e autenticação.

Funções:
- `criarTabela`: Cria a tabela de usuário no banco de dados.
- `cadastrarUsuario`: Registra um novo usuário na aplicação.
- `logar`: Autentica um usuário existente e gera um token JWT.
- `descobrirUsuarioLogado`: Retorna informações sobre o usuário autenticado.

### Atualização Controller

Este controlador lida com postagens de atualizações e carregamento de postagens existentes.

Funções:
- `criarTabela`: Cria a tabela de atualizações no banco de dados.
- `postar`: Cria uma nova atualização no sistema.
- `carregarPostagens`: Retorna postagens formatadas para exibição na tela inicial.

## 7. Rotas

As rotas são definidas em arquivos separados dentro da pasta `routes`.

Exemplos:
- `/registrar`: Rota para o cadastro de um novo usuário.
- `/logar`: Rota para autenticação e login de um usuário.
- `/postar`: Rota para criar uma nova atualização.

## 8. Frontend

O frontend da aplicação é construído utilizando HTML, CSS e JavaScript. As páginas são renderizadas dinamicamente com base nas informações obtidas do servidor.

## 9. Futuras Features

O Inter Project é um projeto em constante evolução. Abaixo estão algumas das futuras features planejadas:

1. **Controle de Acesso:**
   - Adição de tipos de usuários, incluindo:
     - Espectador: Pode apenas visualizar as atualizações.
     - Administrador: Tem controle total sobre o sistema.
     - Verificado: Pode postar novas atualizações.

2. **Imagens nas Postagens:**
   - Capacidade de adicionar imagens às atualizações para enriquecer o conteúdo.

3. **Perfis dos Usuários:**
   - Implementação de perfis individuais para cada usuário.

4. **Comentários e Curtidas:**
   - Adição de funcionalidades de comentários e curtidas nas postagens.

5. **Principal Atualização:**
   - Destaque para uma notícia muito importante da semana, exibida em uma seção especial.

6. **Aba de Comunidade:**
   - Visualização de todos os funcionários cadastrados em uma seção dedicada.

7. **Foto Personalizada de Perfil:**
   - Permitir que os usuários adicionem fotos personalizadas aos seus perfis.

Fique atento para as atualizações, pois essas features trarão mais funcionalidades e melhorias à experiência dos usuários. Se tiver sugestões ou feedback, sinta-se à vontade para contribuir para o desenvolvimento contínuo do Inter Project.

## 10. Conclusão

O Inter Project é uma aplicação flexível e escalável que permite aos usuários compartilharem suas atualizações e interagirem. Lembrando que é um projeto em andamento, com funções ainda por vir. Explore a documentação do código.
