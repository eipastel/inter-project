// Variáveis iniciais
let tipoUsuario;

const API = `https://inter-project-d39u.onrender.com/`
// const API = `http://localhost:3000/`
const barraProgresso = document.getElementById('progresso');

// Assim que a página carrega, fazendo todas as operações
document.addEventListener("DOMContentLoaded", async function() {
    const usuarioLogado = await descobrirUsuarioLogado();
    simularCarregamento(250);
    carregarPostagens();
    
    // Caso o usuário esteja logado, trocando as informações.
    if(usuarioLogado) {
        // Trocando as informações necessárias do usuário logado
        let nomeUsuarioAPostar = document.getElementById('nome-do-usuario-a-postar');
        nomeUsuarioAPostar.innerHTML = `<h5 id="nome-do-usuario-a-postar">${usuarioLogado.nome}</h5>`

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
    } else {
        window.location.href = "/login";
        return;
    }
});

// Função para carregar e exibir postagens
async function carregarPostagens() {
    try {
        // Buscar as últimas postagens do servidor
        const response = await fetch(`${API}postagens`);
        const data = await response.json();
        const postagensDoServidor = data.postagensFormatadas;

        // Renderizar as postagens no DOM
        renderizarPostagens(postagensDoServidor);
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
    }
}

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
            // Atualizando as postagens na tela
            await carregarPostagens();
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
};

function irParaLogin() {
    window.location.href = "/login";
};

function sairDaConta() {
    localStorage.removeItem('jwtToken');
    irParaLogin();
};

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
                tipoUsuario: informacao.tipoUsuario
            };
            return usuarioLogado;
        }
    } catch (error) {
        console.error('Erro ao realizar a requisição:', error);
        return null;
    }
};

// Função para redirecionar para perfil específico
function irParaPerfil(usuario) {
    window.location.href = `/perfil/${usuario}`;
};

// Função para excluir uma atualização
async function excluirPostagem(idPostagem) {
    let temCerteza = confirm("Tem certeza que deseja excluir essa atualização?");
    if(temCerteza) {
        try {
            // Faça a solicitação para o backend para excluir a postagem
            const response = await fetch(`${API}excluirPostagem/${idPostagem}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('jwtToken'),
                },
            });
    
            // Verifique se a resposta foi bem-sucedida (status 200)
            if (response.ok) {
                // Remova a postagem da DOM
                const postagemRemovida = document.querySelector(`.postagem-${idPostagem}`);
                if (postagemRemovida) {
                    postagemRemovida.remove();
                } else {
                    console.warn('Postagem não encontrada na DOM.');
                }
            } else {
                console.error('Erro ao excluir postagem:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Erro ao realizar a requisição para excluir postagem:', error);
        }
    } else {
        alert("Operação de exclusão cancelada!")
    }
}

// Função para curtir ou descutir postagem
async function curtirPublicacao(idUsuario, idPostagem) {
    try {
        // Atualizando na tela o comentário curtido
        formatarCurtidas(idPostagem);
        // Enviando a curtida para o backend
        const response = await fetch(`${API}curtirPostagem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwtToken'),
            },
            body: JSON.stringify({
                idUsuario: idUsuario,
                idPostagem: idPostagem,
                curtidoEm: dataAtual(),
            }),
        });

        // Verificando se a ação foi bem-sucedida
        if (response.ok) {
            // 
        } else {
            console.error('Erro ao curtir/descurtir atualização:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erro ao curtir/descurtir atualização:', error);
        alert('Erro ao curtir/descurtir atualização. Tente novamente mais tarde.');
    }
}

// Função para curtir ou descutir postagem
async function comentarPostagem(idUsuario, idPostagem, nomeUsuarioLogado) {
    try {
        let inputComentario = document.querySelector(`.comentario-input-postagem-${idPostagem}`);
        let comentario = inputComentario.value;

        if (!comentario || comentario.trim() === "") {
            alert("Preencha o campo de comentário para comentar!");
            return;
        } else {
            // Adicionando o comentário diretamente na tela
            adicionarComentarioNaTela(idPostagem, {
                nomeusuario: nomeUsuarioLogado,
                comentario: comentario
            });
            inputComentario.value = ""
            // Enviando o comentário para o backend
            const response = await fetch(`${API}comentarPostagem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('jwtToken'),
                },
                body: JSON.stringify({
                    idUsuario: idUsuario,
                    idPostagem: idPostagem,
                    comentario: comentario,
                }),
            });

            // Verificando se a ação foi bem-sucedida
            if (response.ok) {
                // Tratativa da resposta OK do backend
            } else {
                console.error('Erro ao comentar na atualização:', response.status, response.statusText);
            }
        }
    } catch (error) {
        console.error('Erro ao comentar na atualização:', error);
        alert('Erro ao comentar na atualização. Tente novamente mais tarde.');
    }
}

// Função para adicionar um comentário na tela
function adicionarComentarioNaTela(idPostagem, comentario) {
    const containerComentarios = document.querySelector(`.container-comentarios-${idPostagem}`);
    const quantidadeComentariosParagrafo = document.querySelector(`.info-comentarios-${idPostagem}`)
    let quantidadeComentarios = quantidadeComentariosParagrafo.textContent
    let arrayQuantidadeComentarios = quantidadeComentarios.split(" ");
    let novoValor = arrayQuantidadeComentarios[0]

    if (containerComentarios) {
        const divComentario = document.createElement("div");
        divComentario.classList.add("comentario");
        divComentario.innerHTML = `<h3>${comentario.nomeusuario}</h3><p>${comentario.comentario}</p>`;
        containerComentarios.appendChild(divComentario);

        novoValor++
        arrayQuantidadeComentarios[0] = novoValor;
        quantidadeComentariosParagrafo.textContent = `${arrayQuantidadeComentarios[0]} ${novoValor != 1 ? 'Comentários' : 'Comentário'}`
        } else {
        console.warn(`Container de comentários não encontrado para a postagem ${idPostagem}`);
    }
}

// Função para editar postagem (não implementada)
function editarPostagem(idPostagem) {
}

// Função para modificar a quantidade e a palavra de curtidas na tela
function formatarCurtidas(idPostagem) {
    let iconDaPostagem = document.getElementById(`icone-da-postagem-${idPostagem}`);
    let quantidadeCurtidasParagrafo = document.querySelector(`.curtidas-post-${idPostagem}`);
    let estadoTextoCurtir = document.querySelector(`.estado-texto-curtir-${idPostagem}`);
    let quantidadeCurtidas = quantidadeCurtidasParagrafo.textContent
    let arrayQuantidadeCurtidas = quantidadeCurtidas.split(" ");
    let novoValor = arrayQuantidadeCurtidas[0]

    if (estadoTextoCurtir.textContent == "Curtido") {
        novoValor--;
        iconDaPostagem.classList.remove('fa-solid');
        iconDaPostagem.classList.remove('comentario-curtido');
        iconDaPostagem.classList.add('fa-regular');
        estadoTextoCurtir.textContent = "Curtir";
    } else if (estadoTextoCurtir.textContent == "Curtir") {
        novoValor++;
        iconDaPostagem.classList.add('fa-solid');
        iconDaPostagem.classList.add('comentario-curtido');
        iconDaPostagem.classList.remove('fa-regular');
        estadoTextoCurtir.textContent = "Curtido";
    }

    arrayQuantidadeCurtidas[0] = novoValor;
    quantidadeCurtidasParagrafo.textContent = `${arrayQuantidadeCurtidas[0]} ${novoValor != 1 ? 'Curtidas' : 'Curtida'}`
}

// Função para formatar a data do banco para o formato semântico
function dataFormatada(data) {
    const meses = [
    "janeiro", "fevereiro", "março",
    "abril", "maio", "junho",
    "julho", "agosto", "setembro",
    "outubro", "novembro", "dezembro"];

    const [dataParte, horaParte] = data.split('@');
    const [dia, mes, ano] = dataParte.split('-');
    const [hora, minuto] = horaParte.split(':');
    const dataFormatada = `${dia} de ${meses[parseInt(mes, 10) - 1]}, ${ano} - ${hora}:${minuto}`;
    return dataFormatada;
}

// Função para abrir o modal de criar novo post
async function abrirModalPost() {
    if(!localStorage.getItem('jwtToken')) {
        alert("Você não está logado!")
        return;
    };

    const modalCriacaoPost = document.querySelector('.container-modal-para-postar');
    modalCriacaoPost.style.display = "block"
};

// Função para fechar modal de criar novo post
function fecharModalPost() {
    const modalCriacaoPost = document.querySelector('.container-modal-para-postar');
    modalCriacaoPost.style.display = "none"
}

// Função para focar o teclado no input de comentário
function focarComentario(idPostagem) {
    let inputComentario = document.querySelector(`.comentario-input-postagem-${idPostagem}`);
    inputComentario.focus();
}

// Função para renderizar postagens no DOM
async function renderizarPostagens(postagens) {
    const usuarioLogado = await descobrirUsuarioLogado();
    const idUsuarioLogado = usuarioLogado.id;
    const todasAtualizacoes = document.querySelector('.container-atualizacoes');
    todasAtualizacoes.innerHTML = '';
    postagens.forEach(postagem => {
        const idPostagem = postagem.id;
        const cabecalhoDaAtualizacao = criarCabecalhoAtualizacao(postagem.nomeusuario, dataFormatada(postagem.criadoem), postagem.usuario);
        const conteudoAtualizacao = criarConteudoAtualizacao(postagem.mensagemnovaatt);
        const acoesExtras = criarAcoesExtras(idPostagem, postagem.curtidas, idUsuarioLogado);
        const infoAcoesExtras = criarInfoAcoesExtras(idPostagem, postagem.comentarios, postagem.curtidas);
        const containerComentarios = criarContainerComentarios(postagem.comentarios, idPostagem);
        const containerComentar = criarFormularioComentario(idPostagem, usuarioLogado);

        const divMaior = document.createElement("div");
        const novaDiv = document.createElement("div");
        novaDiv.classList.add("container-da-atualizacao", `postagem-${idPostagem}`);
        novaDiv.innerHTML = `
            ${cabecalhoDaAtualizacao.outerHTML}
            ${conteudoAtualizacao.outerHTML}
            <div class="container-extras">
                ${acoesExtras.outerHTML}
                ${infoAcoesExtras.outerHTML}
                ${containerComentarios.outerHTML}
            </div>
            ${containerComentar.outerHTML}
        `;

        divMaior.innerHTML = `
                ${novaDiv.outerHTML}
        `;

        // Adiciona a nova postagem no final da lista
        todasAtualizacoes.insertBefore(divMaior, todasAtualizacoes.firstChild);
    });
    
    // Parando de mostrar o carregamento
    barraProgresso.style.display = 'none';
}

// Função para criar o cabeçalho da atualização
function criarCabecalhoAtualizacao(nomeUsuario, criadoEm, usuario) {
    const cabecalhoDaAtualizacao = document.createElement("div");
    cabecalhoDaAtualizacao.classList.add("cabecalho-da-atualizacao");

    const imagemCabecalho = document.createElement("div");
    imagemCabecalho.classList.add("imagem-cabecalho");
    imagemCabecalho.innerHTML = `<img src="/img/foto-exemplo-perfil.jpg" alt="Foto usuário da postagem">`;

    const textosCabecalho = document.createElement("div");
    textosCabecalho.classList.add("textos-cabecalho");
    textosCabecalho.innerHTML = `<h2 onclick="irParaPerfil('${usuario}');">${nomeUsuario}</h2><p>${criadoEm}</p>`;

    cabecalhoDaAtualizacao.appendChild(imagemCabecalho);
    cabecalhoDaAtualizacao.appendChild(textosCabecalho);

    return cabecalhoDaAtualizacao;
}

// Função para criar o conteúdo da atualização
function criarConteudoAtualizacao(mensagem) {
    const conteudoAtualizacao = document.createElement("div");
    conteudoAtualizacao.classList.add("conteudo-atualizacao");
    conteudoAtualizacao.innerHTML = `<p class="textos-atualizacao">${mensagem}</p>`;

    return conteudoAtualizacao;
}

// Função para criar as ações extras
function criarAcoesExtras(idPostagem, curtidas, idUsuarioLogado) {
    const acoesExtras = document.createElement("div");
    acoesExtras.classList.add("acoes-extras");

    let estaCurtidoPeloUsuarioLogado = false;
    for(let index = 0; index < curtidas.length; index++) {
        if(curtidas[index].idusuario == idUsuarioLogado) {
            estaCurtidoPeloUsuarioLogado = true;
        }
    }

    const acaoCurtir = document.createElement("div");
    acaoCurtir.classList.add("acao-curtir", `comentariocurtido-${idPostagem}`);
    acaoCurtir.setAttribute("onclick", `curtirPublicacao(${idUsuarioLogado}, ${idPostagem})`);

    acaoCurtir.innerHTML = `
    <i id="icone-da-postagem-${idPostagem}" class="${estaCurtidoPeloUsuarioLogado ? 'fa-solid comentario-curtido' : 'fa-regular'} fa-heart"></i>
    <p class="estado-texto-curtir-${idPostagem}">${estaCurtidoPeloUsuarioLogado ? 'Curtido' : 'Curtir'}</p>`;
    
    const acaoComentar = document.createElement("div");
    acaoComentar.classList.add("acao-comentar");
    acaoComentar.setAttribute("onclick", `focarComentario(${idPostagem})`);
    acaoComentar.innerHTML = `<i class="fa-regular fa-comment"></i><p>Comentar</p>`;

    acoesExtras.appendChild(acaoCurtir);
    acoesExtras.appendChild(acaoComentar);

    return acoesExtras;
}

// Função para criar o container de comentários
function criarContainerComentarios(arrayComentarios, idPostagem) {
    const containerComentarios = document.createElement("div");
    containerComentarios.classList.add("container-comentarios", `container-comentarios-${idPostagem}`);

    // Verifica se há comentários
    if (arrayComentarios[0].id != null) {
        for(let index = 0; index < arrayComentarios.length; index++) {
            const comentario = arrayComentarios[index];

            const divComentario = document.createElement("div");
            divComentario.classList.add("comentario");

            const nomeUsuario = comentario.nomeusuario
            divComentario.innerHTML = `<h3>${nomeUsuario}</h3><p>${comentario.comentario}</p>`;

            containerComentarios.insertBefore(divComentario, containerComentarios.firstChild);
        }
    } else {
        // Tratativa para caso não hajam comentários
    }
    return containerComentarios;
}

// Função para criar o formulário de comentário
function criarFormularioComentario(idPostagem, usuarioLogado) {
    const containerComentar = document.createElement("div");
    containerComentar.classList.add("container-comentar");
    containerComentar.innerHTML = `
        <img src="/img/foto-exemplo-perfil.jpg" width="48px" alt="Foto usuário da postagem">
        <input maxlength="60" type="text" class="comentario-input-postagem-${idPostagem}" name="comentario" id="comentario" placeholder="Adicione o seu comentário...">
        <button id="botao-postar-comentario" onclick="comentarPostagem(${usuarioLogado.id}, ${idPostagem}, '${usuarioLogado.nome}');">Comentar</button>`;
    return containerComentar;
}

// Função para criar as informações extras de ações
function criarInfoAcoesExtras(idPostagem, comentarios, curtidas) {
    const infoAcoesExtras = document.createElement("div");
    infoAcoesExtras.classList.add("info-acoes-extras");
    let singPluralCurtida, singPluralComentarios, quantidadeCurtidas, quantidadeComentarios;

    if(curtidas[0].id != null) {
        quantidadeCurtidas = curtidas.length;
    } else {
        quantidadeCurtidas = 0;
    }

    if(comentarios[0].id != null) {
        quantidadeComentarios = comentarios.length;
    } else {
        quantidadeComentarios = 0;
    }

    switch (quantidadeCurtidas) {
        case 0:
            singPluralCurtida = "Curtidas";
            break;
        case 1:
            singPluralCurtida = "Curtida";
            break;
        default:
            singPluralCurtida = "Curtidas";
            break;
    }

    switch (quantidadeComentarios) {
        case 0:
            singPluralComentarios = "Comentários";
            break;
        case 1:
            singPluralComentarios = "Comentário";
            break;
        default:
            singPluralComentarios = "Comentários";
            break;
    }

    infoAcoesExtras.innerHTML = `
        <p class="info-curtidas curtidas-post-${idPostagem}">${quantidadeCurtidas} ${singPluralCurtida}</p>
        <p class="info-comentarios info-comentarios-${idPostagem}">${quantidadeComentarios} ${singPluralComentarios}</p>
    `;
    return infoAcoesExtras;
}

// Função para simular o carregamento
function simularCarregamento(progresso) {
    barraProgresso.style.width = progresso + '%';
}
