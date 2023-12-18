// Variáveis iniciais
let listaDeAtt = [];
let tipoUsuario;

// Assim que a página carrega, fazendo todas as operações
document.addEventListener("DOMContentLoaded", async function() {
    const usuarioLogado = await descobrirUsuarioLogado();
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

// Função para carregar postagens
async function carregarPostagens() {
    try {
        const response = await fetch('https://inter-project-d39u.onrender.com/postagens');
        const data = await response.json();
        const postagens = data.postagensFormatadas;
        const usuarioLogado = await descobrirUsuarioLogado();
        const todasAtualizacoes = document.querySelector('.container-atualizacoes');
        let containerAtualizacoes = document.querySelector('.container-atualizacoes');
        let cabecalhoDaAtualizacao, conteudoAtualizacao, acoesExtras, infoAcoesExtras, containerComentarios, containerComentar, comentarios, quantidadeCurtidas, estadoCurtida;
        containerAtualizacoes.innerHTML = '';

        for(let index = 0; index < postagens.length; index++) {
            comentarios = ``
            quantidadeCurtidas = 0
            let infoUsuarioCurtiu = await verificarCurtida(usuarioLogado.id, postagens[index].id);
            quantidadeCurtidas = infoUsuarioCurtiu.quantidadeDeCurtidas

            // Se o usuário curtiu a publicação, trocar as classes e adicionar o css
            if(infoUsuarioCurtiu.curtido && infoUsuarioCurtiu.idUsuario == usuarioLogado.id) {
                estadoCurtida = `fa-solid comentario-curtido`;
                estadoTextoCurtir =`Curtido`;
            } else {
                estadoCurtida = `fa-regular `;
                estadoTextoCurtir = `Curtir`;
            }

            let comentariosDoPost = postagens[index].comentarios
            if(comentariosDoPost.length) {
                // Para cada comentário, adiciona-lo na div container-comentario
                for(let index = 0; index < comentariosDoPost.length; index++) {
                    comentarios += `
                        <div class="comentario">
                            <h3>${comentariosDoPost[index].nomeUsuario}</h3>
                            <p>${comentariosDoPost[index].comentario}</p>
                        </div>
                    `;
                }
            } else {
                containerComentarios = ``;
            }

            containerComentarios = `
            <div class="container-comentarios"> 
                ${comentarios}
            </div>`

            cabecalhoDaAtualizacao = `
                <div class="cabecalho-da-atualizacao">
                    <div class="imagem-cabecalho">
                        <img src="/img/foto-exemplo-perfil.jpg" alt="Foto usuário da postagem">
                    </div>
                    <div class="textos-cabecalho">
                        <h2 onclick="irParaPerfil('${postagens[index].usuario}');">${postagens[index].nomeUsuario}</h2>
                        <p>${dataFormatada(postagens[index].criadoem)}</p>
                    </div>
                </div>`;

            // Se tiver imagem!!
            // conteudoAtualizacao = `
            //     <div class="conteudo-atualizacao">
            //         <p class="textos-atualizacao">${postagens[index].mensagemnovaatt}</p>
            //         <img src="/img/teste.png" alt="Imagem do post do usuário">
            //     </div>`;

            conteudoAtualizacao = `
                <div class="conteudo-atualizacao">
                    <p class="textos-atualizacao">${postagens[index].mensagemnovaatt}</p>
                </div>`;
            
            acoesExtras = `
                <div class="acoes-extras">
                    <div class="acao-curtir comentariocurtido-${postagens[index].id}" onclick="curtirPublicacao(${usuarioLogado.id}, ${postagens[index].id})";>
                        <i id="icone-da-postagem-${postagens[index].id}" class="${estadoCurtida} fa-heart"></i>
                        <p>${estadoTextoCurtir}</p>
                    </div>
                    <div onclick="focarComentario(${postagens[index].id});" class="acao-comentar">
                        <iclass="fa-regular fa-comment"></i>
                        <p>Comentar</p>
                    </div>
                </div>`;
            
            infoAcoesExtras = `
                <div class="info-acoes-extras">
                    <p class="info-curtidas curtidas-post-${postagens[index].id}">${quantidadeCurtidas} Curtidas</p>
                    <p class="info-comentarios">${comentariosDoPost.length} Comentários</p>
                </div>`;

            containerComentar = `
                <div class="container-comentar">
                    <img src="/img/foto-exemplo-perfil.jpg" width="48px" alt="Foto usuário da postagem">
                    <input maxlength="60" type="text" class="comentario-input-postagem-${postagens[index].id}" name="comentario" id="comentario" placeholder="Adicione o seu comentário...">
                    <button id="botao-postar-comentario" onclick="comentarPostagem(${usuarioLogado.id}, ${postagens[index].id});">Comentar</button>
                </div>`;

            const novaDiv = document.createElement("div");
            novaDiv.innerHTML = `
                <div class="container-da-atualizacao postagem-${postagens[index].id}">
                    ${cabecalhoDaAtualizacao}

                    ${conteudoAtualizacao}

                    <div class="container-extras">
                        ${acoesExtras}

                        ${infoAcoesExtras}

                        ${containerComentarios}
                    </div>

                    ${containerComentar}
                </div>
            `;

            // Adiciona a nova postagem ao início da lista
            todasAtualizacoes.insertBefore(novaDiv, todasAtualizacoes.firstChild);
        }
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
    }
};

async function postar() {
    // Se for um usuário Verificado ou Administrador a atualização será postada
    if(tipoUsuario === "Verificado" || tipoUsuario === "Administrador") {
        // Variáveis iniciais
        let mensagemNovaAttInput = document.getElementById('conteudo-da-atualizacao-a-postar');
        let mensagemNovaAtt = mensagemNovaAttInput.value;

        // Bloqueando clicks por 3 segundos após postar
        let janelaTela = document.body
        janelaTela.style.pointerEvents = 'none';
        setTimeout(() => {
            janelaTela.style.pointerEvents = 'auto';
        }, 3000);

        if(!mensagemNovaAtt || mensagemNovaAtt.trim() == "") {
            alert("Preencha o campo para fazer uma postagem!")
            return;
        }

        // Limpando o campo da atualização
        mensagemNovaAttInput.value = "";

        // Double check do usuário logado
        const usuarioLogado = await descobrirUsuarioLogado();
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

        // Fechando o modal no momento que o post é feito.
        fecharModalPost();

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
        .catch((error) => {
            // Caso haja algum erro não identificado do servidor ou outro.
            console.error('Erro não identificado:', error);
        });
        // Atualizando as postagens na tela
        carregarPostagens();
    } else {
        // Se for um usuário do tipo Espectador
        alert(`Como ${tipoUsuario = "usuário não logado"} você não tem permissão para postar!`);
    }
};

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
        const response = await fetch('https://inter-project-d39u.onrender.com/usuarioLogado', {
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
            const response = await fetch(`https://inter-project-d39u.onrender.com/excluirPostagem/${idPostagem}`, {
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
        // Enviando a postagem para o backend
        fetch('https://inter-project-d39u.onrender.com/curtirPostagem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('jwtToken'),
            },
            body: JSON.stringify({
                idUsuario: idUsuario,
                idPostagem: idPostagem,
                curtidoEm: dataAtual()
            }),
            })
            .then(response => response.json())
            .catch((error) => {
                // Caso haja algum erro não identificado do servidor ou outro.
                throw error
            });

            // Desativando o usuário de clicar por 3 segundos segundo
            let divCurtir = document.querySelector(`.comentariocurtido-${idPostagem}`)
            divCurtir.style.pointerEvents = 'none';
            setTimeout(() => {
                divCurtir.style.pointerEvents = 'auto';
            }, 3000);


            let iconDaPostagem = document.getElementById(`icone-da-postagem-${idPostagem}`);
            if(iconDaPostagem.classList.value.includes('fa-regular')) {
                formatarCurtidas(idPostagem, 'adicionar');
            } else {
                formatarCurtidas(idPostagem, 'remover');
            }
    } catch(error) {
        throw error
    }
};

// Função para curtir ou descutir postagem
async function comentarPostagem(idUsuario, idPostagem) {
    try {
        let inputComentario = document.querySelector(`.comentario-input-postagem-${idPostagem}`);
        let comentario = inputComentario.value

        if(!comentario || comentario.trim() === "") {
            alert("Preencha o campo de comentário para comentar!");
            return;
        } else {
            // Enviando o comentário para o backend
            fetch('https://inter-project-d39u.onrender.com/comentarPostagem', {
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
                })
                .then(response => response.json())
                .then(data => {
                if (data.error) {
                    // Tratando caso haja um erro

                } else {
                    // Sucesso ao comentar (limpando o campo e atualizando as postagens na tela)
                    inputComentario.value = '';
                    carregarPostagens();
                }
                })
                .catch((error) => {
                    // Caso haja algum erro não identificado do servidor ou outro.
                    console.error('Erro não identificado:', error);
                });
            }     
    } catch(error) {
        console.error("Erro não identificado: ", error)
    }
}

// Função para editar postagem
function editarPostagem(idPostagem) {



}

// Função para formatar a quantidade de curtidas (adicionar 1)
function formatarCurtidas(idPostagem, acao) {
    let quantidadeCurtidasParagrafo = document.querySelector(`.curtidas-post-${idPostagem}`);
    let iconDaPostagem = document.getElementById(`icone-da-postagem-${idPostagem}`);
    let quantidadeCurtidas = quantidadeCurtidasParagrafo.textContent
    let arrayQuantidadeCurtidas = quantidadeCurtidas.split(" ");
    let novoValor = arrayQuantidadeCurtidas[0]

    if(acao == 'remover') {
        novoValor--
        iconDaPostagem.classList.remove('fa-solid');
        iconDaPostagem.classList.remove('comentario-curtido');
        iconDaPostagem.classList.add('fa-regular');
    } else if(acao == 'adicionar') {
        novoValor++
        iconDaPostagem.classList.add('fa-solid');
        iconDaPostagem.classList.add('comentario-curtido');
        iconDaPostagem.classList.remove('fa-regular');
    }

    arrayQuantidadeCurtidas[0] = novoValor;
    quantidadeCurtidasParagrafo.textContent = `${arrayQuantidadeCurtidas[0]} Curtidas`
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

function fecharModalPost() {
    const modalCriacaoPost = document.querySelector('.container-modal-para-postar');
    modalCriacaoPost.style.display = "none"
}

function focarComentario(idPostagem) {
    let inputComentario = document.querySelector(`.comentario-input-postagem-${idPostagem}`);
    inputComentario.focus()
}

async function verificarCurtida(idUsuario, idPostagem) {
    try {
        const response = await fetch(`https://inter-project-d39u.onrender.com/verificarCurtida/${idUsuario}/${idPostagem}`);
        const data = await response.json();

        return data;
    } catch(error) {
        throw error;
    }
}