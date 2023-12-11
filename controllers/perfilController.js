const perfilModel = require('../models/perfilModel.js');
const path = require('path');

// Controlador para obter informações do perfil
async function irParaPerfil(req, res, next) {
    try {
        const { nomeUsuario } = req.params;
        const resultadoConsulta = await perfilModel.obterPerfil(nomeUsuario);

        if (resultadoConsulta.error) {
            return res.status(409).json({ error: resultadoConsulta.error });
        }

        res.sendFile(path.join(__dirname, '../views/perfil.html'));
    } catch (error) {
        next(error);
    }
}

// Controlador para obter informações do perfil
async function obterUsuario(req, res, next) {
    try {
        const { nomeUsuario } = req.params;
        const resultadoConsulta = await perfilModel.obterPerfil(nomeUsuario);

        if (resultadoConsulta.error) {
            return res.status(409).json({ error: resultadoConsulta.error });
        }

        res.json(resultadoConsulta);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    // Funções exportadas:
    irParaPerfil,
    obterUsuario,
    
};
