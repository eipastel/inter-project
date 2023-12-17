# README - Pasta JS

## 1. `index.js`:

Este arquivo é responsável pela lógica da tela inicial.

### Variáveis Iniciais:
- `listaDeAtt`: Array para armazenar atualizações.
- `tipoUsuario`: Variável para armazenar o tipo de usuário logado.

### Eventos:
- `DOMContentLoaded`: Evento que dispara as operações assim que a página é carregada.

### Funções Principais:
- `carregarPostagens`: Carrega e exibe as postagens na interface.
- `postar`: Publica uma nova atualização.
- `descobrirUsuarioLogado`: Obtém informações sobre o usuário logado.
- `curtirPublicacao`: Função para curtir ou descurtir uma postagem (não implementada).
- `comentarPostagem`: Adiciona um comentário a uma postagem.
- `dataAtual`: Retorna a data e hora atuais formatadas.
- `dataFormatada`: Formata a data do banco para um formato mais legível.
- `abrirModalPost` e `fecharModalPost`: Controlam a exibição do modal de criação de postagens.
- `focarComentario`: Foca no campo de comentário de uma postagem.

## 2. `login.js`:

Este arquivo gerencia as operações relacionadas à página de login.

### Eventos:
- `DOMContentLoaded`: Verifica se o usuário está logado ao carregar a página.
- `.login-button`: Escuta o botão de login para executar a ação de login.

### Funções Principais:
- `descobrirUsuarioLogado`: Obtém informações sobre o usuário logado.

## 3. `pagina-de-registro.js`:

Este arquivo gerencia as operações relacionadas à página de registro.

### Eventos:
- `DOMContentLoaded`: Verifica se o usuário está logado ao carregar a página.
- `.botao-de-registro`: Escuta o botão de registro para executar a ação de registro.

### Funções Principais:
- `temNumero` e `temEspacos`: Verificam se uma string contém números ou espaços.
- `fecharModal`: Fecha o modal de usuário já existente exibido na interface.
- `dataAtual`: Retorna a data e hora atuais formatadas.
- `descobrirUsuarioLogado`: Obtém informações sobre o usuário logado.

**Observações:**
- O código contém comentários que explicam a lógica e a função de cada parte do código.
- Algumas funcionalidades podem não estar implementadas, conforme indicado nos comentários no código.

**Nota:** Este README fornece uma visão geral básica. Certifique-se de consultar a documentação e os comentários dentro do código para obter detalhes adicionais sobre a implementação.

**Autor:**
Thiago Diogo - thiagodev.diogo@gmail.com - 17/12/2023
