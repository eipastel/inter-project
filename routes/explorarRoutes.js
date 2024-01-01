const express = require('express');
const path = require('path');
const explorarController = require('../controllers/explorarController');

const router = express.Router();

// Rota para explorar
router.get('/explorar', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'explorar.html'));
});

// Rota para ver todos os usuários formatados em card
router.get('/explorarUsuarios', explorarController.explorarUsuarios);

module.exports = router;