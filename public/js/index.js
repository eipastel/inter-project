// Variáveis iniciais
let botaoPostar = document.getElementById('botao-postar');
let botaoTelasMenores = document.getElementById('botao-telas-menores');
let cadastroELogin = document.querySelector('.cadastro-e-login');
let botaoSair = document.querySelector('.botao-sair');
let listaDeAtt = [];
let tipoUsuario;

// Assim que a página carrega, fazendo todas as operações
document.addEventListener("DOMContentLoaded", async function() {
    // Variáveis iniciais
    let mensagemNovaAttInput = document.getElementById('mensagem-nova-att');

    // Adicionando dois ouvintes de evento para os 2 botões de postar
    botaoPostar.addEventListener("click", function(evento) {
        postar(evento);
    });

    botaoTelasMenores.addEventListener("click", function(evento) {
        postar(evento);
    });

    const usuarioLogado = await descobrirUsuarioLogado();
    carregarPostagens();

    if(usuarioLogado) {
        cadastroELogin.remove();
        botaoSair.style.display = 'block';

        if(usuarioLogado.tipoUsuario === 1) {
            // Condições para o usuário administrador
            tipoUsuario = "Administrador"

        } else if(usuarioLogado.tipoUsuario === 2 || !usuarioLogado) {
            // Condições para o usuário espectador
            mensagemNovaAttInput.placeholder = "Você não tem permissão!";
            mensagemNovaAttInput.disabled = "true";
            tipoUsuario = "Espectador"

        } else if(usuarioLogado.tipoUsuario === 3) {
            // Condições para o usuário verificado
            tipoUsuario = "Verificado"
        }
    } else {
    
    }
});

// Função para carregar postagens
async function carregarPostagens() {
    try {
        const response = await fetch('https://inter-project-d39u.onrender.com/postagens');
        const data = await response.json();
        const postagens = data.postagensFormatadas;
        const todasAtualizacoes = document.querySelector('.atualizacoes');

        for(let index = 0; index < postagens.length; index++) {
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
        </div>
            `;

            // Adiciona a nova postagem ao início da lista
            todasAtualizacoes.insertBefore(novaDiv, todasAtualizacoes.firstChild);
        }
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        console.error('Detalhes do erro:', error.message, error.response);
        console.error('Tipo do erro:', error.constructor.name);
    }
}

async function postar(evento) {
    evento.preventDefault();
    evento.stopPropagation();

    // Se for um usuário Verificado ou Administrador
    if(tipoUsuario === "Verificado" || tipoUsuario === "Administrador") {
        // Variáveis padrões
        let mensagemNovaAttInput = document.getElementById('mensagem-nova-att');
        let mensagemNovaAtt = mensagemNovaAttInput.value;

        if(!mensagemNovaAtt) {
            console.error("Preencha o campo para fazer uma postagem!")
            return;
        }

        // Limpando o campo da atualização
        mensagemNovaAttInput.value = "";

        // Definindo qual o usuário logado
        const usuarioLogado = await descobrirUsuarioLogado();

        // Verificando se o usuário foi obtido corretamente
        if (!usuarioLogado) {
            console.log("Usuário não encontrado. A atualização não será postada.");
            return;
        }

        // Criando o objeto da nova atualização
        let novaAtt = {
            mensagemNovaAtualizacao: mensagemNovaAtt,
            idUsuario: usuarioLogado.id,
            criadoEm: dataAtual()
        }

        // Enviando a postagem para o backend
        fetch('https://inter-project-d39u.onrender.com/postar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwtToken'),
        },
        body: JSON.stringify({
            mensagemNovaAtualizacao: novaAtt.mensagemNovaAtualizacao,
            idUsuario: novaAtt.idUsuario,
            criadoEm: novaAtt.criadoEm
        }),
        })
        .then(response => response.json())
        // Caso haja algum erro não identificado do servidor ou outro.
        .catch((error) => {
            console.error('Erro não identificado:', error);
        });

        // Mostrando a postagem na tela
        let todasAtualizacoes = document.querySelector('.atualizacoes');
        let novaDiv = document.createElement("div");
        novaDiv.innerHTML = `
        <div class="post">
        <div class="post-profile-image">
            <img src="./img/foto-padrao-perfil.png" alt="Imagem Perfil do Usuário">
        </div>

        <div class="post-body">
            <div class="post-header">
                <div class="post-header-text">
                    <h3>${usuarioLogado.nome}
                        <span class="header-icon-section">
                            @${usuarioLogado.usuario}
                        </span>
                    </h3>
                </div>

                <div class="post-header-discription">
                    <p>${novaAtt.mensagemNovaAtualizacao}</p>
                </div>
                
            </div>

            <div class="post-footer">
                <i class="fa-regular fa-comment"></i>
                <i class="fa-regular fa-heart"></i>
            </div>

        </div>
        </div>
            `
        if (todasAtualizacoes.firstChild) {
            todasAtualizacoes.insertBefore(novaDiv, todasAtualizacoes.firstChild);
        } else {
            todasAtualizacoes.appendChild(novaDiv);
        }
    } else {
        // Se for um usuário do tipo Espectador
        alert(`Como ${tipoUsuario} você não tem permissão para postar!`);
    }

}

// Funções utilitárias
function dataAtual() {
    let hoje = new Date();
    let dia = hoje.getDate().toString().padStart(2, '0');
    let mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    let ano = hoje.getFullYear();
    let horas = hoje.getHours().toString().padStart(2, '0');
    let minutos = hoje.getMinutes().toString().padStart(2, '0');
    let segundos = hoje.getSeconds().toString().padStart(2, '0');
    let dataAtual = `${dia}-${mes}-${ano}@${horas}:${minutos}:${segundos}`;

    return dataAtual;
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
})

function irParaPerfil(usuario) {
    window.location.href = `/perfil/${usuario}`;
}