const db = require('../config/dbConfig.js');

async function explorarUsuarios() {
    try {
        const resultadoConsulta = await db`
            SELECT
                u.nome,
                u.usuario,
                u.id_tipo_usuario,
                u.caminho_foto_perfil,
                COALESCE(atualizacoes.quantidade_atualizacoes, 0) AS quantidade_atualizacoes,
                COALESCE(seguidores.quantidade_seguidores, 0) AS quantidade_seguidores
            FROM
                usuarios u
            LEFT JOIN (
                SELECT id_usuario, COUNT(id) AS quantidade_atualizacoes
                FROM atualizacoes
                GROUP BY id_usuario
            ) atualizacoes ON u.id = atualizacoes.id_usuario
            LEFT JOIN (
                SELECT seguido_id, COUNT(id) AS quantidade_seguidores
                FROM seguidores
                GROUP BY seguido_id
            ) seguidores ON u.id = seguidores.seguido_id
            WHERE u.caminho_foto_perfil IS NOT NULL
            ORDER BY u.id;`;

        return resultadoConsulta;
    } catch(error) {
        throw error
    }
}

module.exports = {
    // Funções exportadas:
    explorarUsuarios,

};
