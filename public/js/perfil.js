// Variáveis inicias
let nome = document.querySelector('.nome');
let usuario = document.querySelector('.usuario');
let entrouEm = document.querySelector('.entrou-em');
let cidade = document.querySelector('.cidade');
let usuarioDoPerfil = perfilDeQuem();
let cadastroELogin = document.querySelector('.cadastro-e-login');
let botaoSair = document.querySelector('.botao-sair');

document.querySelector('.container-inicio').addEventListener('click', () => {
    window.location.href = `/`;
});

// Assim que a página carrega, fazendo todas as operações
document.addEventListener("DOMContentLoaded", async function() {
    const usuarioLogado = await descobrirUsuarioLogado();
    if(usuarioLogado) {
        cadastroELogin.remove();
        botaoSair.style.display = 'block';   
    }
});

// Faz a solicitação GET para obter informações do perfil
async function obterPerfil() {
    try {
        const response = await fetch(`https://inter-project-d39u.onrender.com/obterPerfil/${usuarioDoPerfil}`);

        if (!response.ok) {
            throw new Error(`Erro na solicitação: ${response.status}`);
        }
        const perfilDoUsuario = await response.json();
        nome.innerHTML = `<h2 class="nome">${perfilDoUsuario.nome}</h2>`
        usuario.innerHTML = `<h2 class="nome">@${usuarioDoPerfil}</h2>`

        carregarPostagensUnicas(perfilDoUsuario);

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

async function descobrirUsuarioLogado() {
    try {
        // Obtenha o token da localStorage
        let tokenUsuarioLogado = localStorage.getItem('jwtToken');

        // Verifique se o token existe
        if (!tokenUsuarioLogado) {
            return null;
        }

        // Faça a requisição para o backend com o token no cabeçalho
        const response = await fetch('https://inter-project-d39u.onrender.com/usuarioLogado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenUsuarioLogado,
            },
        });

        // Verifique se a resposta é bem-sucedida (status 200)
        if (!response.ok) {
            console.log("Erro na requisição:", response.status);
            return null;
        }

        // Parse da resposta JSON
        const informacao = await response.json();

        // Verifique se há um erro na resposta
        if (informacao.error) {
            console.log("Erro não identificado: ", informacao.error);
            return null;
        } else {
            // Defina quem é o usuário logado
            let usuarioLogado = {
                nome: informacao.nome,
                email: informacao.email,
                usuario: informacao.usuario,
                id: informacao.id,
                tipoUsuario: informacao.tipoUsuario
            };
            return usuarioLogado;
        }
    } catch (error) {
        console.error('Erro ao realizar a requisição:', error);
        return null;
    }
}

document.querySelector('.container-perfil').addEventListener('click', () => {
    let perfilDo = prompt("O perfil de qual usuário você gostaria de acessar?");

    // Verifica se o usuário inseriu algo
    if (perfilDo) {
        // Redireciona para a página de login com o nome do usuário como parte da URL
        window.location.href = `/perfil/${perfilDo}`;
    }
});

// Função para carregar postagens
async function carregarPostagensUnicas(perfilDoUsuario) {
    try {
        const response = await fetch('https://inter-project-d39u.onrender.com/postagens');
        const data = await response.json();
        const postagens = data.postagensFormatadas;
        const todasAtualizacoes = document.querySelector('.atualizacoes');

        for(let index = 0; index < postagens.length; index++) {

            if(postagens[index].idUsuario == perfilDoUsuario.id) {
                const novaDiv = document.createElement("div");
                novaDiv.innerHTML = `
                <div class="post">
                    <div class="post-profile-image">
                        <img src="/img/foto-padrao-perfil.png" alt="Imagem Perfil do Usuário">
                    </div>
                
                    <div class="post-body">
                        <div class="post-header">
                            <div class="post-header-text">
                                <h3>${postagens[index].nomeUsuario}
                                    <span onclick="irParaPerfil('${postagens[index].usuario}');" class="header-icon-section">
                                        @${postagens[index].usuario}
                                    </span>
                                </h3>
                            </div>
                
                            <div class="post-header-discription">
                                <p>${postagens[index].mensagemnovaatt}</p>
                            </div>
                            
                        </div>
                
                        <div class="post-footer">
                            <i class="fa-regular fa-comment"></i>
                            <i class="fa-regular fa-heart"></i>
                        </div>
                
                    </div>
                </div>`;
                // Adiciona a nova postagem ao início da lista
                todasAtualizacoes.insertBefore(novaDiv, todasAtualizacoes.firstChild);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        console.error('Detalhes do erro:', error.message, error.response);
        console.error('Tipo do erro:', error.constructor.name);
    }
};