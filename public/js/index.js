// Variáveis iniciais
let tipoUsuario;
let numeroPostagensCarregadas = 0;

const API = `https://inter-project-d39u.onrender.com/`
// const API = `http://localhost:3000/`
const barraProgresso = document.getElementById('progresso');

document.getElementById('conteudo-da-atualizacao-a-postar').addEventListener('input', () => {
    let quantidadeMaximaCaracteres = 300
    let inputPostar = document.getElementById('conteudo-da-atualizacao-a-postar');
    let caracteresRestantesValor = quantidadeMaximaCaracteres - inputPostar.value.length
    let caracteresRestantes = document.querySelector('.caracteres-restantes');
    if(caracteresRestantesValor >= 200) {
        caracteresRestantes.innerHTML = `<p class="caracteres-restantes">Restantes: <span class="texto-verde">${caracteresRestantesValor}</span></p>`;
    } else if(caracteresRestantesValor >= 100) {
        caracteresRestantes.innerHTML = `<p class="caracteres-restantes">Restantes: <span class="texto-amarelo">${caracteresRestantesValor}</span></p>`;
    } else if(caracteresRestantesValor >= 31){
        caracteresRestantes.innerHTML = `<p class="caracteres-restantes">Restantes: <span class="texto-vermelho">${caracteresRestantesValor}</span></p>`;
    } else {
        caracteresRestantes.innerHTML = `<p class="caracteres-restantes">Restantes: <span class="texto-critico">${caracteresRestantesValor}</span></p>`;
    }
});

// Assim que a página carrega, fazendo todas as operações
document.addEventListener("DOMContentLoaded", async function() {
    const usuarioLogado = await descobrirUsuarioLogado();
    simularCarregamento(250);
    carregarPostagens(numeroPostagensCarregadas);

    window.addEventListener('scroll', verificarScroll);
    
    // Caso o usuário esteja logado, trocando as informações.
    if(usuarioLogado) {
        // Trocando as informações necessárias do usuário logado
        let nomeUsuarioAPostar = document.getElementById('nome-do-usuario-a-postar');
        nomeUsuarioAPostar.innerHTML = `<h5 id="nome-do-usuario-a-postar">${formatarNomeCompleto(usuarioLogado.nome)}</h5>`
        let fotosPerfil = document.querySelectorAll('.foto-perfil-dinamica');

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
    } else {
        window.location.href = "/login";
        return;
    }
});

// Função para fazer o carregamento de mais publicações conforme o usuário scrolla
async function verificarScroll() {
    const alturaTotal = document.documentElement.scrollHeight;
    const alturaJanela = window.innerHeight;
    const posicaoAtual = window.scrollY;

    // Verifica se o usuário rolou até o final da página
    if (posicaoAtual + alturaJanela >= alturaTotal) {
        // Atualiza o número de postagens carregadas
        numeroPostagensCarregadas += 2;
        // Carregue mais postagens do backend
        const maisPostagensDisponiveis = await carregarPostagens(numeroPostagensCarregadas);

        // Verifica se há mais postagens disponíveis
        if (!maisPostagensDisponiveis) {
            // Se não há mais postagens, remova o event listener para parar de verificar o scroll
            window.removeEventListener('scroll', verificarScroll);
        }
    }
}

// Função para carregar e exibir postagens
async function carregarPostagens(pagina) {
    try {
        let response
        if(pagina == 6581) {
            response = await fetch(`${API}postagens?pagina=0&random=${Math.random()}`);
        } else {
            response = await fetch(`${API}postagens?pagina=${pagina}&random=${Math.random()}`);
        }
        const data = await response.json();
        const postagensDoServidor = data.postagensFormatadas.postagensFormatadas;

        // Renderizar as novas postagens no DOM
        renderizarPostagens(postagensDoServidor, pagina);
        
        // Verificar se há mais postagens disponíveis
        const maisPostagensDisponiveis = data.postagensFormatadas.maisPostagensDisponiveis;
        return maisPostagensDisponiveis;
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
            await carregarPostagens(6581);
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
async function renderizarPostagens(postagens, segredo) {
    const usuarioLogado = await descobrirUsuarioLogado();
    const idUsuarioLogado = usuarioLogado.id;
    const todasAtualizacoes = document.querySelector('.container-atualizacoes');

    if(segredo === 6581) {
        todasAtualizacoes.innerHTML = `<main class="container-atualizacoes"></main>`;
    }

    // Adiciona as novas postagens ao final da lista
    postagens.forEach(postagem => {
        const idPostagem = postagem.id;
        const cabecalhoDaAtualizacao = criarCabecalhoAtualizacao(postagem.nomeusuario, dataFormatada(postagem.criadoem), postagem.usuario, postagem.caminhofotoperfil, usuarioLogado.usuario);
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

        // Adiciona a nova postagem abaixo das já existentes
        const ultimaPostagem = todasAtualizacoes.lastChild;
        if(ultimaPostagem.value == undefined) { 
            todasAtualizacoes.appendChild(divMaior);
        } else {
            todasAtualizacoes.insertBefore(divMaior, ultimaPostagem.nextSibling);
        }
    });

    // Parando de mostrar o carregamento
    barraProgresso.style.display = 'none';
}

// Função para criar o cabeçalho da atualização
function criarCabecalhoAtualizacao(nomeUsuario, criadoEm, usuario, caminhofotoperfil, usuarioLogado) {
    const cabecalhoDaAtualizacao = document.createElement("div");
    cabecalhoDaAtualizacao.classList.add("cabecalho-da-atualizacao");

    const imagemCabecalho = document.createElement("div");
    imagemCabecalho.classList.add("imagem-cabecalho");
    imagemCabecalho.innerHTML = `<img src="${caminhofotoperfil ? caminhofotoperfil : '/img/foto-exemplo-perfil.jpg'}" alt="Foto usuário da postagem">`;

    const textosCabecalho = document.createElement("div");
    textosCabecalho.classList.add("textos-cabecalho");
    textosCabecalho.innerHTML = `<h2 onclick="abrirPerfilAoClicar('${usuario}', '${usuarioLogado}')");">${formatarNomeCompleto(nomeUsuario)} <span class="cabecalho-usuario">@${usuario}</span></h2><p>${criadoEm}</p>`;

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