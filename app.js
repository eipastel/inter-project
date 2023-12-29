// Importações iniciais
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const usuarioRoutes = require('./routes/usuarioRoutes');
const atualizacaoRoutes = require('./routes/atualizacaoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Configurar o multer para armazenar temporariamente os arquivos enviados
const storage = multer.memoryStorage(); // Salva o arquivo em buffer de memória
const upload = multer({ storage: storage });

// Middleware express.static para servir arquivos estáticos da pasta 'public'
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('./public'));

app.use(usuarioRoutes);
app.use(atualizacaoRoutes);
app.use(perfilRoutes);
app.use(comentarioRoutes);

// Nova rota para upload de imagens
app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const apiKey = '6d207e02198a847aa98d0a2a901485a5';
    const uploadUrl = 'https://freeimage.host/api/1/upload';

    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('action', 'upload');
    formData.append('source', req.file.buffer.toString('base64')); // Converter buffer para base64

    const respostaFreeimage = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const respostaJson = respostaFreeimage.data;
    res.json(respostaJson);
  } catch (erro) {
    console.error('Erro ao processar a imagem:', erro);
    res.status(500).json({ error: 'Erro ao processar a imagem' });
  }
});

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
