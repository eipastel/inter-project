// Variáveis inicias
let nome = document.querySelector('.nome');
let usuario = document.querySelector('.usuario');
let entrouEm = document.querySelector('.entrou-em');
let cidade = document.querySelector('.cidade');
let usuarioDoPerfil = perfilDeQuem();

document.querySelector('.container-inicio').addEventListener('click', () => {
    window.location.href = `/`;
})

// Faz a solicitação GET para obter informações do perfil
async function obterPerfil() {
    try {
        const response = await fetch(`https://inter-project-d39u.onrender.com/obterPerfil/${usuarioDoPerfil}`);

        if (!response.ok) {
            throw new Error(`Erro na solicitação: ${response.status}`);
        }
        const perfilDoUsuario = await response.json();
        nome.innerHTML = `<h2 class="nome">${perfilDoUsuario.nome}</h2>`
        usuario.innerHTML = `<h2 class="nome">${usuarioDoPerfil}</h2>`

    } catch(error) {
        console.error("Erro durante a solicitação:", error);
    }
}
obterPerfil()

// Função utilitária
function perfilDeQuem() {
    // Pega o caminho da URL
    const caminhoURL = window.location.pathname;
    // Divide a URL para obter partes específicas
    const partesURL = caminhoURL.split('/');

    return nomeUsuario = partesURL[partesURL.length - 1];
}

function irParaLogin() {
    window.location.href = "/login";
}

function sairDaConta() {
    localStorage.removeItem('jwtToken');
    location.reload()
}