// Variáveis iniciais
let tipoUsuario, usuariosCadastrados;
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
async function removerPublicacao(idPostagem) {
    let temCerteza = confirm("Não é possível excluir publicações, apenas oculta-las, deseja continuar?");

    if(temCerteza) {
        try {
            // Faça a solicitação para o backend para excluir a postagem
            console.log(idPostagem, dataAtual())
            const response = await fetch(`${API}excluirPostagem`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('jwtToken'),
                },
                body: JSON.stringify({
                    idPostagem: idPostagem,
                    removidoEm: dataAtual(),
                }),
            });
    
            // Verifique se a resposta foi bem-sucedida (status 200)
            if (response.ok) {
                // Remova a postagem da DOM
                alert("Exclusão realizada com sucesso!");
                location.reload();
            } else {
                console.error('Erro ao excluir postagem:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Erro ao realizar a requisição para excluir postagem:', error);
        }
    } else {
        alert("Operação cancelada!")
    }
}

// Função para curtir ou descutir postagem
async function curtirPublicacao(idUsuario, idPostagem, idUsuarioNotificado) {
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
            // Se for, notificar usuário
            const response = await fetch(`${API}notificarUsuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('jwtToken'),
                },
                body: JSON.stringify({
                    idUsuarioAcao: idUsuario, 
                    idUsuarioNotificado: idUsuarioNotificado, 
                    idAcao: idPostagem, 
                    idTipoAcao: 1, 
                    criadoEm: dataAtual(),
                }),
            });
        } else {
            console.error('Erro ao curtir/descurtir atualização:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erro ao curtir/descurtir atualização:', error);
        alert('Erro ao curtir/descurtir atualização. Tente novamente mais tarde.');
    }
}

// Função para curtir ou descutir postagem
async function comentarPostagem(idUsuario, idPostagem, nomeUsuarioLogado, idUsuarioNotificado) {
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
                // Se for, notificar usuário
                const response = await fetch(`${API}notificarUsuario`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('jwtToken'),
                    },
                    body: JSON.stringify({
                        idUsuarioAcao: idUsuario, 
                        idUsuarioNotificado: idUsuarioNotificado, 
                        idAcao: idPostagem, 
                        idTipoAcao: 2, 
                        criadoEm: dataAtual(),
                    }),
                });
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

// Função para editar postagem (implementando)
async function editarPostagem(idPostagem, caminhoFotoPerfil, nomeUsuario) {
    // Obter dados da postagem a ser editada
    const response = await fetch(`${API}verPostagem/${idPostagem}`);
    const postagem = await response.json();

    // Atualizar estadoAtual
    estadoAtual = {
        modo: "edicao",
        idPostagemEditar: idPostagem,
    };

    // Variáveis iniciais
    let containerTitulo = document.querySelector('.container-cabecalho-modal');
    let inputEditarPost = document.getElementById('conteudo-da-atualizacao-a-postar');
    let nomeUsuarioAPostar = document.getElementById('nome-do-usuario-a-postar');
    let visibilidadeEBotao = document.querySelector('.visibilidade');
    let fotoPerfil = document.querySelector('.profile-img');
    let restantes = document.querySelector('.texto-verde');
    abrirModalPost('edicao');

    // Preencher campos do modal com dados da postagem
    inputEditarPost.value = `${postagem.mensagemnovaatt}`
    containerTitulo.innerHTML = `<h4>Edite a publicação</h4>`
    nomeUsuarioAPostar.textContent = ` ${formatarNomeCompleto(nomeUsuario)}`
    visibilidadeEBotao.innerHTML = `
        <button onclick="trocarInformacoesPublicacao(${idPostagem})" id="botao-editar-atualizacao">Salvar Edição</button>
        <button onclick="removerPublicacao(${idPostagem})" id="botao-excluir-atualizacao">Excluir Postagem</button>
    `
    fotoPerfil.src = `${caminhoFotoPerfil}`
    restantes.innerText = `${300 - inputEditarPost.value.length}`
}

async function trocarInformacoesPublicacao(idPostagem) {
    let inputEditarPost = document.getElementById('conteudo-da-atualizacao-a-postar').value;

    try {
        fetch(`${API}editarPostagem`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwtToken'),
            },
            body: JSON.stringify({
                editadoEm: dataAtual(),
                novaMensagem: inputEditarPost,
                idPostagem: idPostagem
            }),
            })
            .then(response => {
                if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Informações atualizadas com sucesso.
                console.log('Informações atualizadas com sucesso:', data);
                location.reload();
            })
            .catch(error => {
                console.error('Erro durante a requisição:', error);
            });
    } catch(error) {
        throw error
    }
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

// Função para fechar modal de criar novo post
function fecharModalPost() {
    const modalCriacaoPost = document.querySelector('.container-modal-para-postar');
    modalCriacaoPost.style.display = "none"
}

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
    const todasAtualizacoesArray = document.querySelectorAll('.container-atualizacoes div');

    if(segredo === 6581) {
        todasAtualizacoesArray.forEach(elemento => {
            elemento.remove();
        });
    }

    // Adiciona as novas postagens ao final da lista
    postagens.forEach(postagem => {
        const divMaior = document.createElement("div");
        if(postagem.disponivel === true) {
            const idPostagem = postagem.id;
            const cabecalhoDaAtualizacao = criarCabecalhoAtualizacao(postagem.nomeusuario, dataFormatada(postagem.criadoem), postagem.usuario, postagem.caminhofotoperfil, usuarioLogado.usuario);
            const conteudoAtualizacao = criarConteudoAtualizacao(postagem.mensagemnovaatt);
            const acoesExtras = criarAcoesExtras(idPostagem, postagem.curtidas, idUsuarioLogado, postagem.caminhofotoperfil, postagem.nomeusuario, postagem.idusuariopostagem);
            const infoAcoesExtras = criarInfoAcoesExtras(idPostagem, postagem.comentarios, postagem.curtidas);
            const containerComentarios = criarContainerComentarios(postagem.comentarios, idPostagem);
            const containerComentar = criarFormularioComentario(idPostagem, usuarioLogado, postagem.idusuariopostagem);
    
            const novaDiv = document.createElement("div");
            novaDiv.classList.add("container-da-atualizacao", `postagem-${idPostagem}`);
            if(postagem.idusuariopostagem === 1) {
                novaDiv.classList.add('postagem-importante')
            }
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
        } 

        // Adiciona a nova postagem abaixo das já existentes
        const ultimaPostagem = todasAtualizacoes.lastChild;
        if(ultimaPostagem.value === undefined) { 
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
    textosCabecalho.innerHTML = `<h2 onclick="abrirPerfilAoClicar('${usuario}', '${usuarioLogado}')");">${formatarNomeCompleto(nomeUsuario)} <span class="cabecalho-usuario">@${usuario}</span></h2><p>${criadoEm}.</p>`;

    cabecalhoDaAtualizacao.appendChild(imagemCabecalho);
    cabecalhoDaAtualizacao.appendChild(textosCabecalho);

    return cabecalhoDaAtualizacao;
}

// Função para criar o conteúdo da atualização
function criarConteudoAtualizacao(mensagem, maximoDeLinhas = 7) {
    const conteudoAtualizacao = document.createElement("div");
    conteudoAtualizacao.classList.add("conteudo-atualizacao");

    // Substituir "\n" por elementos <br>
    const linhas = mensagem.split('\n');
    const mensagemComQuebrasDeLinha = linhas.slice(0, maximoDeLinhas).join('<br>');

    // Se houver mais linhas além do limite, exibir o restante na mesma linha
    const restanteMensagem = linhas.slice(maximoDeLinhas).join(' ');
    const mensagemFinal = restanteMensagem ? `${mensagemComQuebrasDeLinha} ${restanteMensagem}` : mensagemComQuebrasDeLinha;

    conteudoAtualizacao.innerHTML = `<p class="textos-atualizacao">${mensagemFinal}</p>`;

    return conteudoAtualizacao;
}

// Função para criar as ações extras
function criarAcoesExtras(idPostagem, curtidas, idUsuarioLogado, caminhoFotoPerfil, nomeUsuarioAPostar, idUsuarioPublicacao) {
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
    acaoCurtir.setAttribute("onclick", `curtirPublicacao(${idUsuarioLogado}, ${idPostagem}, ${idUsuarioPublicacao})`);

    acaoCurtir.innerHTML = `
        <i id="icone-da-postagem-${idPostagem}" class="${estaCurtidoPeloUsuarioLogado ? 'fa-solid comentario-curtido' : 'fa-regular'} fa-heart"></i>
        <p class="estado-texto-curtir-${idPostagem}">${estaCurtidoPeloUsuarioLogado ? 'Curtido' : 'Curtir'}</p>
    `;
    
    const acaoComentar = document.createElement("div");
    acaoComentar.classList.add("acao-comentar");
    acaoComentar.setAttribute("onclick", `focarComentario(${idPostagem})`);
    acaoComentar.innerHTML = `<i class="fa-regular fa-comment"></i><p>Comentar</p>`;

    acoesExtras.appendChild(acaoCurtir);
    acoesExtras.appendChild(acaoComentar);

    if(tipoUsuario == "Administrador") {
        const acaoEditarPublicacao = document.createElement("div");
        acaoEditarPublicacao.classList.add("acao-editar-publicacao");
        acaoEditarPublicacao.setAttribute("onclick", `editarPostagem(${idPostagem}, '${caminhoFotoPerfil}', '${nomeUsuarioAPostar}')`);
        acaoEditarPublicacao.innerHTML = `<i class="fa-regular fa-pen-to-square"></i><p>Editar</p>`;
        acoesExtras.appendChild(acaoEditarPublicacao);
    }

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

            containerComentarios.appendChild(divComentario);
        }
    } else {
        // Tratativa para caso não hajam comentários
    }
    return containerComentarios;
}

// Função para criar o formulário de comentário
function criarFormularioComentario(idPostagem, usuarioLogado, idUsuarioNotificado) {
    const containerComentar = document.createElement("div");
    containerComentar.classList.add("container-comentar");
    containerComentar.innerHTML = `
        <img src="${usuarioLogado.caminho_foto_perfil ? usuarioLogado.caminho_foto_perfil : '/img/foto-exemplo-perfil.jpg'}" width="48px" alt="Foto usuário da postagem">
        <input maxlength="60" type="text" class="comentario-input-postagem-${idPostagem}" name="comentario" id="comentario" placeholder="Adicione o seu comentário...">
        <button id="botao-postar-comentario" onclick="comentarPostagem(${usuarioLogado.id}, ${idPostagem}, '${usuarioLogado.nome}', ${idUsuarioNotificado});">Comentar</button>`;
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
