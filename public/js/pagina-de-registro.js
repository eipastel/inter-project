const API = `https://inter-project-d39u.onrender.com/`
// const API = `http://localhost:3000/`

// Assim que a página carrega, verifica se o usuário está logado
document.addEventListener("DOMContentLoaded", async function() {
    const usuarioLogado = await descobrirUsuarioLogado();

    // Caso o usuário esteja logado, mandando ele para a página principal
    if(usuarioLogado) {
        window.location.href = "/";
        return;
    }
});

// Escutando o botão para quando o usuário der o submit
document.querySelector('.botao-de-registro').addEventListener('click', (evento) => {
    // Prevenindo o e-mail automático do formulário
    evento.preventDefault();

    // Variáveis iniciais
    let nomeInput = document.getElementById('nome');
    let usuarioInput = document.getElementById('usuario');
    let emailInput = document.getElementById('email');
    let senhaInput = document.getElementById('senha');
    let confirmacaoSenhaInput = document.getElementById('confirmacaoSenha');
    let mensagemDeErro = document.querySelector('.mensagem-de-erro');
    let mensagemDeSucesso = document.querySelector('.mensagem-de-sucesso');
    let modal = document.getElementById('meu-modal');
    let criadoEm;

    // Valores dos campos
    let nome = nomeInput.value;
    let usuario = usuarioInput.value;
    let email = emailInput.value;
    let senha = senhaInput.value;
    let confirmacaoSenha = confirmacaoSenhaInput.value;

    // Validando se os campos estão preenchidos corretamente
    let nomeValido = false;
    let emailValido = false;
    let senhaValida = false;
    let usuarioValido = false;
    let confirmacaoSenhaValida = false;

    if(nome.length > 2 && !temNumero(nome) && !temEmoji(nome)) {
        nomeValido = true;
    } else {
        // Tratativa caso o nome não esteja devidamente preenchido
        nomeValido = false;
    }

    if(usuario.length < 3 || temEspacos(usuario) || temEmoji(usuario)) {
        // Tratativa caso o usuário não esteja devidamente preenchido
        usuarioValido = false;
    } else {
        usuarioValido = true;
    }

    if(email.length >= 9 && !temEmoji(email)) {
       emailValido = true;
    } else {
        // Tratativa caso o e-mail não esteja devidamente preenchido
        emailValido = false;
    }

    if(senha.length > 2 && !temEmoji(senha)) {
        senhaValida = true;
    } else {
        // Tratativa caso a senha não esteja devidamente preenchida
        senhaValida = false;
    }

    if(confirmacaoSenha === senha) {
        confirmacaoSenhaValida = true;
    } else {
        // Tratativa caso a confirmação de senha não esteja devidamente preenchida
        confirmacaoSenhaValida = false;
    }

    // Se todos os campos forem válidos, criando o usuário
    if(nomeValido && usuarioValido && emailValido && senhaValida && confirmacaoSenhaValida) {
        mensagemDeErro.style.display = "none";
        mensagemDeSucesso.style.display = "block";

        criadoEm = dataAtual();

        try {
            // Enviando o usuário para o backend
            fetch(`${API}registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome,
                    usuario: usuario,
                    email: email,
                    senha: senha,
                    criadoEm: criadoEm,
                }),
                })
                .then(response => response.json())
                .then(data => {
                if (data.error === "USER_ALREADY_EXISTS") {
                    // Tratando caso o usuário já exista
                    modal.style.display = 'block';
                } else {
                    // Armazenando o token JWT
                    localStorage.setItem('jwtToken', data.token);
                    window.location.href = '/'
                    alert("Cadastro realizado com sucesso!");
                }
                })
                // Caso haja algum erro não identificado do servidor ou outro.
                .catch((error) => {
                    console.error('Erro não identificado:', error);
                });
        } catch(error) {
            console.error("Erro não identificado: ", error)
        }
    } else {
        // Tratando caso os usuários não estejam válidos
        mensagemDeErro.style.display = "block"
        mensagemDeSucesso.style.display = "none";
    }
});

// Funções utilitárias
function temNumero(string) {
    const regex = /[0-9]/;
    return regex.test(string);
}

function temEspacos(string) {
    const regex = /\s/g;
    return regex.test(string);
}

function fecharModal() {
    document.getElementById('meu-modal').style.display = 'none';
}

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

// Função para verificar se uma string contém emojis
function temEmoji(string) {
    const regexEmoji = /[\p{Emoji}]/gu;
    return regexEmoji.test(string);
}