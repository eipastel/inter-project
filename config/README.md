# Config - Documentação

A pasta `config` contém as configurações essenciais para o funcionamento do Inter Project. O arquivo `dbConfig.js` é responsável por manter as configurações do banco de dados PostgreSQL.

## dbConfig.js

O arquivo `dbConfig.js` é crucial para a interação eficiente com o banco de dados. Ele utiliza as bibliotecas `postgres` e `dotenv` para gerenciar as configurações do PostgreSQL e carregar variáveis de ambiente.

### Configurações do Banco de Dados:

- **Host:**
  - O endereço do servidor do banco de dados.

- **Database:**
  - O nome do banco de dados utilizado pela aplicação.

- **Username:**
  - O nome de usuário utilizado para autenticação no banco de dados.

- **Password:**
  - A senha associada ao usuário do banco de dados.

- **Port:**
  - A porta utilizada para a conexão com o banco de dados.

- **SSL:**
  - Configuração para requerer a utilização do SSL na conexão.

- **Connection Options:**
  - Opções adicionais para a conexão, neste caso, associadas a um identificador de endpoint.

**Autor:**
Thiago Diogo - thiagodev.diogo@gmail.com - 17/12/2023