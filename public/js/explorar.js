const API = `https://inter-project-d39u.onrender.com/`
// const API = `http://localhost:3000/`

// Variáveis iniciais
let tipoUsuario, usuariosCadastrados, usuarioLogadoUsuario;
const barraProgresso = document.getElementById('progresso');

// Assim que a página carrega, fazendo todas as operações
document.addEventListener("DOMContentLoaded", async function() {
    const usuarioLogado = await descobrirUsuarioLogado();
    usuarioLogadoUsuario = usuarioLogado.usuario
    simularCarregamento(250);

    // Caso o usuário esteja logado, trocando as informações.
    if(usuarioLogado) {
        // Trocando as informações necessárias do usuário logado
        let nomeUsuarioAPostar = document.getElementById('nome-do-usuario-a-postar');
        nomeUsuarioAPostar.textContent = formatarNomeCompleto(usuarioLogado.nome)
        let fotosPerfil = document.querySelectorAll('.foto-perfil-dinamica');
        const notificResponse = await fetch(`${API}verificarNotificacoes/${usuarioLogado.id}`);
        const notificacoesUsuarioLogado = await notificResponse.json();
        let quantidadeNotificacoes = document.querySelector('.quantidade-notificacoes');

        if(usuarioLogado.tipoUsuario === 1) {
            // Condições para o usuário administrador
            tipoUsuario = "Administrador"

        } else if(usuarioLogado.tipoUsuario === 2 || !usuarioLogado) {
            // Condições para o usuário espectador
            tipoUsuario = "Espectador"

        } else if(usuarioLogado.tipoUsuario === 3) {
            // Condições para o usuário verificado
            tipoUsuario = "Verificado"
        }

        fotosPerfil.forEach(fotoPerfil => {
            fotoPerfil.src = usuarioLogado.caminho_foto_perfil ? usuarioLogado.caminho_foto_perfil : '/img/foto-exemplo-perfil.jpg';
        });
        if(notificacoesUsuarioLogado.length > 0) {
            quantidadeNotificacoes.textContent = `${notificacoesUsuarioLogado.length}`;
            quantidadeNotificacoes.classList.add('tem-notificacao');
        }

        // Parando de mostrar o carregamento
        barraProgresso.style.display = 'none';
    } else {
        window.location.href = "/login";
        return;
    }
});

// Função para simular o carregamento
function simularCarregamento(progresso) {
    barraProgresso.style.width = progresso + '%';
}

// Função para descobrir qual o usuário logado
async function descobrirUsuarioLogado() {
    try {
        // Obtenha o token da localStorage
        let tokenUsuarioLogado = localStorage.getItem('jwtToken');

        // Verifique se o token existe
        if (!tokenUsuarioLogado) {
            return null;
        }

        // Faça a requisição para o backend com o token no cabeçalho
        const response = await fetch(`${API}usuarioLogado`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenUsuarioLogado,
            },
        });

        // Verifique se a resposta é bem-sucedida (status 200)
        if (!response.ok) {
            return null;
        }

        // Parse da resposta JSON
        const informacao = await response.json();

        // Verifique se há um erro na resposta
        if (informacao.error) {
            return null;
        } else {
            // Defina quem é o usuário logado
            let usuarioLogado = {
                nome: informacao.nome,
                email: informacao.email,
                usuario: informacao.usuario,
                id: informacao.id,
                tipoUsuario: informacao.tipoUsuario,
                caminho_foto_perfil: informacao.caminho_foto_perfil
            };
            return usuarioLogado;
        }
    } catch (error) {
        console.error('Erro ao realizar a requisição:', error);
        return null;
    }
};

// Função para pegar o primeiro nome
function formatarNomeCompleto(nomeCompleto) {
    // Divindo o nome completo em partes usando o espaço como delimitador
    const partesNome = nomeCompleto.split(' ');
  
    // Obtendo o primeiro nome
    const primeiroNome = partesNome[0];
  
    // Capitalizando apenas o primeiro caractere do primeiro nome
    const primeiroNomeCapitalizado = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1);

    // Se não houver mais partes, retorne apenas o primeiro nome capitalizado
    return primeiroNomeCapitalizado;
}

// Função para abrir o modal de criar novo post
async function abrirModalPost(objetivo) {
    const usuarioLogado = await descobrirUsuarioLogado();
    if(!usuarioLogado) {
        alert("Você não está logado!")
        return;
    };

    let modalCriacaoPost = document.querySelector('.container-modal-para-postar');
    const mensagemNovaAttInput = document.getElementById('conteudo-da-atualizacao-a-postar');
    const fotoPerfilPostagem = document.querySelector('.profile-img');
    const nomeUsuarioAPostar = document.getElementById('nome-do-usuario-a-postar');
    const tituloModal = document.querySelector('.container-cabecalho-modal h4');

    if(objetivo == "nova") {
        mensagemNovaAttInput.value = ''
        fotoPerfilPostagem.src = usuarioLogado.caminho_foto_perfil
        nomeUsuarioAPostar.textContent = formatarNomeCompleto(usuarioLogado.nome)
        tituloModal.textContent = `Crie um Novo Post`
    }
    modalCriacaoPost.style.display = "block"
};

// Função para postar uma nova atualização
async function postar() {
    try {
        // Se for um usuário Verificado ou Administrador a atualização será postada
        if (tipoUsuario === "Verificado" || tipoUsuario === "Administrador") {
            // Variáveis iniciais
            const mensagemNovaAttInput = document.getElementById('conteudo-da-atualizacao-a-postar');
            const mensagemNovaAtt = mensagemNovaAttInput.value;

            if (!mensagemNovaAtt || mensagemNovaAtt.trim() === "") {
                alert("Preencha o campo para fazer uma postagem!");
                return;
            }

            // Desabilitar o botão de postagem
            const botaoPostar = document.getElementById('botao-postar-atualizacao');
            botaoPostar.disabled = true;

            // Limpando o campo da atualização
            mensagemNovaAttInput.value = "";
            fecharModalPost();

            // Double check do usuário logado
            const usuarioLogado = await descobrirUsuarioLogado();
            if (!usuarioLogado) {
                console.log("Usuário não encontrado. A atualização não será postada.");
                return;
            }

            // Criando o objeto da nova atualização
            const novaAtt = {
                mensagemNovaAtualizacao: mensagemNovaAtt,
                idUsuario: usuarioLogado.id,
                criadoEm: dataAtual(),
            };

            // Enviando a postagem para o backend
            const response = await fetch(`${API}postar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('jwtToken'),
                },
                body: JSON.stringify(novaAtt),
            });

            // Verificando se a postagem foi bem-sucedida antes de carregar as postagens
            if (response.ok) {
            } else {
                console.error('Erro ao postar atualização:', response.status, response.statusText);
            }
        }
    } catch (error) {
        console.error('Erro ao postar atualização:', error);
        alert('Erro ao postar atualização. Tente novamente mais tarde.');
    } finally {
        // Habilitar o botão de postagem, independentemente do resultado
        const botaoPostar = document.getElementById('botao-postar-atualizacao');
        botaoPostar.disabled = false;
    }
}

// Função para fechar modal de criar novo post
function fecharModalPost() {
    const modalCriacaoPost = document.querySelector('.container-modal-para-postar');
    modalCriacaoPost.style.display = "none"
}

// Função para retornar a data de hoje, formatada no formato do banco
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
};

// Fetch para obter todos os usuários em um array (com id, nome, usuário e caminho_foto_perfil)
fetch(`${API}pesquisarUsuarios`)
    .then((response) => response.json())
    .then((arrayUsuarios) => {
        usuariosCadastrados = arrayUsuarios;
    });
// Função para filtrar usuários na pesquisa
function filtrarUsuarios() {
    // Variáveis iniciais
    let inputPesquisa = document.getElementById('barra-de-pesquisa');
    let listaProdutos = document.getElementById('lista-usuarios-pesquisas');
    let textoNegrito;
    let filtro = inputPesquisa.value.trim().toUpperCase();
    let contador = 0;
    let maximoResultados = 7;

    // Limpar a lista se o filtro estiver vazio
    if (filtro === '') {
        listaProdutos.innerHTML = '';
        return;
    }

    listaProdutos.innerHTML = ''; // Limpando a lista antes de renderizar novamente

    for (let index = 0; index < usuariosCadastrados.length && contador < maximoResultados; index++) {
        const infoUsuario = usuariosCadastrados[index];
        let nomeUsuario = infoUsuario.nome;

        if (nomeUsuario.trim().toUpperCase().indexOf(filtro) > -1) {
            const li = document.createElement('li');
            li.classList.add('usuario-pesquisa');
            li.innerHTML = `
                <a href="/perfil/${infoUsuario.usuario}">
                    <img class="imagem-usuario-pesquisa" src="${infoUsuario.caminho_foto_perfil ? infoUsuario.caminho_foto_perfil : '/img/foto-exemplo-perfil.jpg'}" alt="Imagem usuário da pesquisa">
                    <span class="nome-usuario-pesquisa">${formatarNomeCompleto(infoUsuario.nome)}</span>
                </a>
            `;
            listaProdutos.appendChild(li);
            textoNegrito = li.querySelector('.nome-usuario-pesquisa');
            contador++;

            if (textoNegrito) {
                textoNegrito.innerHTML = nomeUsuario.replace(new RegExp(filtro, 'gi'), (corresp) => {
                    return '<strong>' + corresp + '</strong>';
                });
            }
        }
    }
}

// Função para mostrar as notificações do usuário logado formatadas
async function abreEFechaNotificacoes() {
    const usuarioLogado = await descobrirUsuarioLogado();
    const listaNotificacoes = document.getElementById('lista-notificacoes');
    const botaoMarcarTodasComoLida = document.querySelector('.botao-marcar-como-lido');
    const infoSemNotificacao = document.querySelector('.info-sem-notificacao');

    // Verifica se o modal está visível
    if (listaNotificacoes.style.display === 'flex') {
        // Se estiver visível, oculta
        listaNotificacoes.style.display = 'none';
    } else {
        // Se estiver oculto, exibe
        listaNotificacoes.style.display = 'flex';
        const notificResponse = await fetch(`${API}verNotificacoes/${usuarioLogado.id}`);
        const notificacoesUsuarioLogado = await notificResponse.json();
        
        if(notificacoesUsuarioLogado.length > 0) {
            const notificacaoItem = document.querySelectorAll('.notificacao-item');
            notificacaoItem.forEach(item => {
                item.remove();
            });
            botaoMarcarTodasComoLida.style.display = "block";
            infoSemNotificacao.style.display = "none";
            for(let index = 0; index < notificacoesUsuarioLogado.length; index++) {
                let tipoAcao;
                const itemNotificacao = notificacoesUsuarioLogado[index];
                const novaNotific = document.createElement('li');
                novaNotific.classList.add('notificacao-item', 'notificacao-nao-lida')
                novaNotific.classList.add(`notificacao-${itemNotificacao.idnotificacao}`)
                novaNotific.onclick = () => {
                    marcarNotificacaoComoLido(itemNotificacao.idnotificacao)
                }
                switch(itemNotificacao.idtipoacao) {
                    case 1:
                        tipoAcao = "curtiu a sua publicação.";
                        break;
                    case 2:
                        tipoAcao = "comentou em sua publicação.";
                        break;
                    case 3:
                        tipoAcao = "começou a te seguir.";
                        break;
                }

                novaNotific.innerHTML = `
                        <div class="container-notificacao">
                            <i id="icone-diamante" class="fa-solid fa-diamond"></i>
                            <p class="mensagem">
                                ${formatarNomeCompleto(itemNotificacao.nomeusuario)} ${tipoAcao}
                            </p>
                        </div>
                `;
                listaNotificacoes.insertBefore(novaNotific, listaNotificacoes.firstChild);
            }
            let quantidadeNotificacoes = document.querySelectorAll('.notificacao-item').length;
            let quantidadeNotificacoesDOM = document.querySelector('.quantidade-notificacoes');
            quantidadeNotificacoesDOM.textContent = quantidadeNotificacoes;
        } else {
            infoSemNotificacao.textContent = "Você não tem notificações!"
            botaoMarcarTodasComoLida.style.display = "none";
            infoSemNotificacao.style.display = "block";
        }
    }
}

async function marcarNotificacaoComoLido(idNotificacao) {
    let notificacaoParaRemover = document.querySelector(`.notificacao-${idNotificacao}`);
    let quantidadeNotificacoes = document.querySelector('.quantidade-notificacoes');
    const infoSemNotificacao = document.querySelector('.info-sem-notificacao');
    const botaoMarcarTodasComoLida = document.querySelector('.botao-marcar-como-lido');
    notificacaoParaRemover.remove();

    try {
        fetch(`${API}marcarComoLida`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwtToken'),
            },
            body: JSON.stringify({
                idNotificacao: [idNotificacao]
            }),
            })
            .then(response => {
                if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Notificação marcada como não lido com sucesso!
            })
            .catch(error => {
                console.error('Erro durante a requisição:', error);
            });
    } catch(error) {
        throw error
    }

    quantidadeNotificacoes.textContent = `${Number(quantidadeNotificacoes.textContent) - 1}`;
    if(Number(quantidadeNotificacoes.textContent) <= 0) {
        quantidadeNotificacoes.classList.remove('tem-notificacao');
        infoSemNotificacao.style.display = "block";
        infoSemNotificacao.textContent = "Todas as notificações foram lidas!";
        botaoMarcarTodasComoLida.style.display = "none";
    }
}

async function marcarTodasAsComoLido() {
    const notificacaoItem = document.querySelectorAll('.notificacao-item');
    let quantidadeNotificacoes = document.querySelector('.quantidade-notificacoes');
    const infoSemNotificacao = document.querySelector('.info-sem-notificacao');
    const botaoMarcarTodasComoLida = document.querySelector('.botao-marcar-como-lido');
    let todasNotificacoesId = [];
    notificacaoItem.forEach(item => {
        todasNotificacoesId.push(Number(item.classList[2].split('-')[1]))
        item.remove();
    });

    try {
        fetch(`${API}marcarComoLida`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwtToken'),
            },
            body: JSON.stringify({
                idNotificacao: [todasNotificacoesId]
            }),
            })
            .then(response => {
                if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Notificação marcada como não lido com sucesso!
                console.log('Todas as notificações marcadas como não lidas com sucesso:', data);
            })
            .catch(error => {
                console.error('Erro durante a requisição:', error);
            });
    } catch(error) {
        throw error
    }

    infoSemNotificacao.textContent = "Todas as notificações foram lidas!";
    infoSemNotificacao.style.display = "block";
    quantidadeNotificacoes.textContent = `0`;
    botaoMarcarTodasComoLida.style.display = "none";
    quantidadeNotificacoes.classList.remove('tem-notificacao');
}

// Mostrar todos os usuários na tela
async function explorarUsuarios() {
    const usuariosJSON = await fetch(`${API}explorarUsuarios`);
    const usuariosFormatados = await usuariosJSON.json();

    for(let index = 0; index < usuariosFormatados.length; index++) {
        const containerUsuarios = document.querySelector('.container-cards-usuarios');
        const usuario = usuariosFormatados[index]
        const novoCard = document.createElement('div');
        novoCard.classList.add('card-container');
        let linhaTipoUsuario; 

        switch(usuario.id_tipo_usuario) {
            case 1:
                linhaTipoUsuario = `<p class="tipo-usuario usuario-adm">Administrador</p>`;
                break;
            case 3:
                linhaTipoUsuario = `<p class="tipo-usuario usuario-verificado">Verificado</p>`;
                break;
        }

        novoCard.innerHTML = `
            <div class="cabecalho-card">
                <img class="foto-perfil-usuario-card" src="${usuario.caminho_foto_perfil}" alt="Foto de Perfil do Usuário">
                <div class="textos-cabecalho-card">
                    <h2>${formatarNomeCompleto(usuario.nome)}</h2>
                    <h4 class="arroba-usuario-card">@${usuario.usuario}</h4>
                    ${linhaTipoUsuario}
                </div>
            </div>
            <div class="container-info-geral-usuario">
                <div class="info-container">
                    <h5 class="titulo-info">Aniversário</h5>
                    <p class="info-usuario">Sem datas no momento!</p>
                </div>
                <div class="info-container">
                    <h5 class="titulo-info">Seguidores</h5>
                    <p class="info-usuario">${usuario.quantidade_seguidores}</p>
                </div>
                <div class="info-container">
                    <h5 class="titulo-info">Postagens</h5>
                    <p class="info-usuario">${usuario.quantidade_atualizacoes}</p>
                </div>
            </div>
            <div class="container-botoes-card-usuario">
                <button onclick="abrirPerfilAoClicar('${usuario.usuario}', '${usuarioLogadoUsuario}')">Visualizar Perfil</button>
            </div>`;
            containerUsuarios.appendChild(novoCard);
    }
}

// Função para abrir o perfil ao clicar em um usuário
function abrirPerfilAoClicar(usuario, usuarioLogado) {
    // Lógica para determinar se o usuário está visualizando o próprio perfil ou o de outro usuário
    if (usuario === usuarioLogado) {
        // Se for o próprio perfil, redirecione para a rota do perfil
        window.location.href = "/perfil";
    } else {
        // Se for o perfil de outro usuário, abra o perfil desse usuário
        window.location.href = `/perfil/${usuario}`;
    }
}

explorarUsuarios()