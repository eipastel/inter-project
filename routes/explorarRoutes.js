const express = require('express');
const path = require('path');

const router = express.Router();

// Rota para explorar
router.get('/explorar', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'explorar.html'));
});

module.exports = router;