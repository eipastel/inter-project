const API = `https://inter-project-d39u.onrender.com/`
// const API = `http://localhost:3000/`

// Variáveis iniciais
let tipoUsuario, fotoSelecionada;
const barraProgresso = document.getElementById('progresso');
const inputImagem = document.getElementById('input-imagem');
const imgFotoPerfil = document.querySelector('.editar-perfil-img');
const uploadUrl = 'http://localhost:3000/upload-image';

// Assim que a página carrega, fazendo todas as operações
document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Coletando variáveis do DOM
        let nomeUsuarioAPostar = document.getElementById('nome-do-usuario-a-postar');
        let nomeUsuario = document.querySelector('.nome-usuario');
        let bioUsuario = document.querySelector('.bio-usuario');
        let infoPublicacoes = document.querySelector('.info-publicacoes');
        let fotosPerfil = document.querySelectorAll('.foto-perfil-dinamica');
        let fotosPerfilCabecalhoDoUsuarioLogado = document.querySelector('.foto-usuario-logado');
        let botaoEditarPerfil = document.querySelector('.botao-editar-perfil');
        let botaoSeguir = document.querySelector('.botao-seguir-usuario');
        let botaoCarregando = document.querySelector('.botao-padrao');

        let nome = document.getElementById('nome');
        let usuario = document.getElementById('usuario');
        let bio = document.getElementById('bio');

        const usuarioLogado = await descobrirUsuarioLogado();
        simularCarregamento(150);

        // Caso o usuário esteja logado, trocando as informações
        if (usuarioLogado) {
            let perfilDoUsuario;

            // Verificando de quem é o perfil e trocando as informações com base nisso
            const nomeUsuarioNaURL = perfilDeQuem();

            if(nomeUsuarioNaURL === usuarioLogado.usuario || nomeUsuarioNaURL == 'perfil') {
                // Obtendo informações detalhadas do perfil do usuário
                const informacoesUsuario = await obterInformacoesUsuario(usuarioLogado.id);
                perfilDoUsuario = informacoesUsuario[0];
                botaoEditarPerfil.style.display = "block"
                botaoCarregando.style.display = "none"
            } else {
                // Obtendo informações detalhadas do perfil do usuário na URL
                const informacoesUsuarioNaURL = await obterInformacoesPeloUsuario(nomeUsuarioNaURL);
                if (!informacoesUsuarioNaURL) {
                    // Lógica para lidar com o usuário não encontrado
                    return;
                }
                perfilDoUsuario = informacoesUsuarioNaURL[0];
                botaoSeguir.style.display = "block"
                botaoCarregando.style.display = "none"
            }

            if (usuarioLogado.tipoUsuario === 1) {
                // Condições para o usuário administrador
                tipoUsuario = "Administrador"

            } else if (usuarioLogado.tipoUsuario === 2 || !usuarioLogado) {
                // Condições para o usuário espectador
                tipoUsuario = "Espectador"

            } else if (usuarioLogado.tipoUsuario === 3) {
                // Condições para o usuário verificado
                tipoUsuario = "Verificado"
            }

            // Trocando as informações necessárias
            nomeUsuarioAPostar.innerHTML = `<h5 id="nome-do-usuario-a-postar">${formatarNomeCompleto(usuarioLogado.nome)}</h5>`
            nomeUsuario.innerHTML = `<h2 class="nome-usuario">${perfilDoUsuario.nome}</h2>`;
            bioUsuario.innerHTML = `<p class="bio-usuario">${perfilDoUsuario.bio ? perfilDoUsuario.bio : ''}</p>`;
            infoPublicacoes.innerHTML = `<p class="texto-info info-publicacoes"><span class="info-num">${perfilDoUsuario.publicacoes[0].id === null ? 0 : perfilDoUsuario.publicacoes.length}</span> ${perfilDoUsuario.publicacoes.length == 1 ? 'Publicação' : 'Publicações'}</p>`;
            fotosPerfil.forEach(fotoPerfil => {
                fotoPerfil.src = perfilDoUsuario.caminho_foto_perfil ? perfilDoUsuario.caminho_foto_perfil : '/img/foto-exemplo-perfil.jpg';
            });
            fotosPerfilCabecalhoDoUsuarioLogado.src = `${usuarioLogado.caminhofotoperfil ? usuarioLogado.caminhofotoperfil : '/img/foto-exemplo-perfil.jpg'}`;
            
            nome.value = `${perfilDoUsuario.nome}`
            usuario.value = `${usuarioLogado.usuario}`
            bio.value = `${perfilDoUsuario.bio ? perfilDoUsuario.bio : ''}`

            renderizarPostagens(perfilDoUsuario);
            // Parando de mostrar o carregamento
            barraProgresso.style.display = 'none';
        } else {
            window.location.href = "/login";
            return;
        }
    } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
    }
});


// Funções utilitárias

// Função para seguir um usuário
function seguirUsuario() {
    alert("Essa funcionalidade ainda não está disponível!")
}

// Função para simular o carregamento
function simularCarregamento(progresso) {
    barraProgresso.style.width = progresso + '%';
}

// Função para obter informações detalhadas do usuário
async function obterInformacoesUsuario(idUsuario) {
    try {
        const response = await fetch(`${API}usuario/${idUsuario}`);
        if (!response.ok) {
            console.log("Erro na requisição:", response.status);
            return null;
        }

        const informacoesUsuario = await response.json();
        return informacoesUsuario;
    } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
        return null;
    }
}

// Função para obter id do usuário da URL
async function obterInformacoesPeloUsuario(usuario) {
    try {
        const response = await fetch(`${API}usuarioperfil/${usuario}`);
        if (!response.ok) {
            console.log("Erro na requisição:", response.status);
            return null;
        }

        const informacoesUsuario = await response.json();
        return informacoesUsuario;
    } catch (error) {
        console.error('Erro ao obter informações do usuário:', error);
        return null;
    }
}

function perfilDeQuem() {
    // Pega o caminho da URL
    const caminhoURL = window.location.pathname;
    // Divide a URL para obter partes específicas
    const partesURL = caminhoURL.split('/');
    return nomeUsuario = partesURL[partesURL.length - 1];
}

// Função para sair da conta (logout)
function sairDaConta() {
    localStorage.removeItem('jwtToken');
    window.location.href = "/login";
    return;
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

// Função para selecionar a foto
function selecionarFoto() {
    fotoSelecionada = '';
}

// Evento para quando selecionar a imagem
// Evento para quando selecionar a imagem
inputImagem.addEventListener('change', async function () {
    try {
        if (this.files.length > 0) {
            const imagem = this.files[0];

            const formData = new FormData();
            formData.append('image', imagem);

            const respostaUpload = await fetch('/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (respostaUpload.ok) {
                const respostaJson = await respostaUpload.json();

                // Verifique se a resposta inclui a propriedade 'image'
                if (respostaJson.image && respostaJson.image.url) {
                    const linkDaImagem = respostaJson.image.url;
                    imgFotoPerfil.src = linkDaImagem;
                    fotoSelecionada = linkDaImagem;
                } else {
                    console.error('Erro ao obter o link da imagem:', respostaJson);
                }
            } else {
                console.error('Erro ao fazer upload da imagem:', respostaUpload.status);
            }
        }
    } catch (erro) {
        console.error('Erro ao processar a imagem:', erro);
    }
});


// Função para salvar as informações do perfil
async function salvarPerfil() {
    try {
        let nomeValido = false;
        let usuarioValido = false;
        let nome = document.getElementById('nome').value;
        let usuario = document.getElementById('usuario').value;
        let bio = document.getElementById('bio').value;
        let caminhoFotoPerfil = fotoSelecionada ? fotoSelecionada : '/img/foto-exemplo-perfil.png';

        // Bloqueando botão salvar enquanto faz as operações
        const botaoSalvar = document.getElementById('botao-salvar-perfil');
        botaoSalvar.disabled = true

        // Obtendo o token da localStorage
        let tokenUsuarioLogado = localStorage.getItem('jwtToken');

        // Verificando se o token existe
        if (!tokenUsuarioLogado) {
            return null;
        }

        if(nome.length > 2 && !temNumero(nome) && !temEmoji(nome)) {
            nomeValido = true;
        } else {
            nomeValido = false;
        }

        if(usuario.length < 3 || temEspacos(usuario) || temEmoji(usuario)) {
            usuarioValido = false;
        } else {
            usuarioValido = true;
        }

        const usuarioLogado = await descobrirUsuarioLogado();

        if(nomeValido && usuarioValido) {
            const response = await fetch('/atualizar-perfil', {
            
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenUsuarioLogado
                },
                body: JSON.stringify({
                    id: usuarioLogado.id,
                    nome,
                    usuario,
                    bio,
                    caminhoFotoPerfil
                })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert(data.message);
                fecharModalEditarPerfil();
                botaoSalvar.disabled = false
                window.location.href = `/perfil`
            } else {
                alert('Erro ao salvar perfil: ' + data.error);
            }
        } else {
            alert("Campo(s) inválido(s)!")
        }
        
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
    }
}

// Função para abrir o modal de editar perfil
async function abrirModalEditarPerfil() {
    if(!localStorage.getItem('jwtToken')) {
        alert("Você não está logado!")
        return;
    };

    const modalCriacaoPost = document.querySelector('.container-modal-para-editar-perfil');
    modalCriacaoPost.style.display = "block"
};

// Função para fechar modal de criar novo post
function fecharModalPost() {
    const modalCriacaoPost = document.querySelector('.container-modal-para-postar');
    modalCriacaoPost.style.display = "none"
}

// Função para fechar modal de criar novo post
function fecharModalEditarPerfil() {
    const modalEditarPerfil = document.querySelector('.container-modal-para-editar-perfil');
    modalEditarPerfil.style.display = "none"
}

// Função para descobrir usuário logado
async function descobrirUsuarioLogado() {
    try {
        // Obtendo o token da localStorage
        let tokenUsuarioLogado = localStorage.getItem('jwtToken');

        // Verificando se o token existe
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

        // Verificando se a resposta é bem-sucedida (status 200)
        if (!response.ok) {
            console.log("Erro na requisição:", response.status);
            return null;
        }

        // Parse da resposta JSON
        const informacao = await response.json();

        // Verificando se há um erro na resposta
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
                tipoUsuario: informacao.tipoUsuario,
                caminhofotoperfil: informacao.caminho_foto_perfil
            };
            return usuarioLogado;
        }
    } catch (error) {
        console.error('Erro ao realizar a requisição:', error);
        return null;
    }
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

// Função para carregar e exibir postagens
function renderizarPostagens(usuario) {
    let postagens = usuario.publicacoes
    if(postagens[0].id === null) {
        const todasAtualizacoes = document.querySelector('.container-publicacoes');
        todasAtualizacoes.innerHTML = '<h3 class="sem-publicacoes">Usuário não tem publicações</>';
    } else {
        const todasAtualizacoes = document.querySelector('.container-publicacoes');
        todasAtualizacoes.innerHTML = '';
    
        postagens.forEach(postagem => {
            const idPostagem = postagem.id;
            const cabecalhoDaAtualizacao = criarCabecalhoAtualizacao(dataFormatada(postagem.criadoem), idPostagem);
            const conteudoAtualizacao = criarConteudoAtualizacao(postagem.mensagemnovaatt);
            const infoAcoesExtras = criarInfoAcoesExtras(idPostagem, postagem.comentarios, postagem.curtidas);
            const containerComentarios = criarContainerComentarios(postagem.comentarios, idPostagem);
    
            const divMaior = document.createElement("div");
            const novaDiv = document.createElement("div");
            novaDiv.classList.add("container-da-atualizacao", `postagem-${idPostagem}`);
            novaDiv.innerHTML = `
                ${cabecalhoDaAtualizacao.outerHTML}
                ${conteudoAtualizacao.outerHTML}
                <div class="container-extras">
                    ${infoAcoesExtras.outerHTML}
                    ${containerComentarios.outerHTML}
                </div>
            `;
    
            divMaior.innerHTML = `
                    ${novaDiv.outerHTML}
            `;
    
            // Adiciona a nova postagem no final da lista
            todasAtualizacoes.insertBefore(divMaior, todasAtualizacoes.firstChild);
        });
    }
    
    // Parando de mostrar o carregamento
    barraProgresso.style.display = 'none';
}

// Função para criar o cabeçalho da atualização
function criarCabecalhoAtualizacao(criadoEm, idPostagem) {
    const cabecalhoDaAtualizacao = document.createElement("div");
    cabecalhoDaAtualizacao.classList.add("cabecalho-da-atualizacao");

    const textosCabecalho = document.createElement("div");
    textosCabecalho.classList.add("textos-cabecalho");
    textosCabecalho.innerHTML = `<h3>#${idPostagem}</h3><p>${criadoEm}</p>`;

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
        <p class="info-comentarios">${quantidadeComentarios} ${singPluralComentarios}</p>
    `;
    return infoAcoesExtras;
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

// Função para verificar se uma string contém emojis
function temEmoji(string) {
    const regexEmoji = /[\p{Emoji}]/gu;
    return regexEmoji.test(string);
}

function temNumero(string) {
    const regex = /[0-9]/;
    return regex.test(string);
}

function temEspacos(string) {
    const regex = /\s/g;
    return regex.test(string);
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