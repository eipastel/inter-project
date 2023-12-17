// Importações iniciais
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const usuarioRoutes = require('./routes/usuarioRoutes');
const atualizacaoRoutes = require('./routes/atualizacaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Middleware express.static para servir arquivos estáticos da pasta 'public'
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('./public'));

app.use(usuarioRoutes);
app.use(atualizacaoRoutes);
app.use(perfilRoutes);
app.use(comentarioRoutes);

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para servir a página HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Inicia o servidor
app.listen({
  port: PORT,
  host: '0.0.0.0'
}, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
