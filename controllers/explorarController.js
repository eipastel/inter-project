const explorarModel = require('../models/explorarModel');

async function explorarUsuarios(req, res, next) {
    try {
        const resultadoConsulta = await explorarModel.explorarUsuarios();

        res.json(resultadoConsulta);
    } catch(error) {
        throw error
    }
}

module.exports = {
    // Funções exportadas:
    explorarUsuarios,

};
