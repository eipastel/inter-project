const API = `https://inter-project-d39u.onrender.com/`
// const API = `http://localhost:3000/`

// Assim que a página carrega,  verifica se o usuário está logado
document.addEventListener("DOMContentLoaded", async function() {
    const usuarioLogado = await descobrirUsuarioLogado();

    // Caso o usuário esteja logado, mandando ele para a página principal
    if(usuarioLogado) {
        window.location.href = "/";
        return;
    }
});

// Escutando o botão para executar a ação do login
document.querySelector('.login-button').addEventListener('click', (evento) => {
    // Prevenindo o efeito padrão de envio do formulário
    evento.preventDefault();

    // Variáveis iniciais
    let emailInput = document.getElementById('email');
    let senhaInput = document.getElementById('senha');
    let mensagemDeErro = document.querySelector('.mensagem-de-erro');
    let mensagemDeSucesso = document.querySelector('.mensagem-de-sucesso');

    // Valores dos campos
    let email = emailInput.value;
    let senha = senhaInput.value;

    // Validando se os campos estão preenchidos corretamente
    let emailValido = false;
    let senhaValida = false;

    if(email.length >= 9) {
        emailValido = true;
        emailInput.classList.remove("erro-ao-registrar");
    } else {
        // Tratativa caso o e-mail não esteja devidamente preenchido
        emailValido = false;
        emailInput.classList.add("erro-ao-registrar");
    }

    if(senha.length > 2) {
        senhaValida = true;
        senhaInput.classList.remove("erro-ao-registrar");
    } else {
        // Tratativa caso a senha não esteja devidamente preenchida
        senhaValida = false;
        senhaInput.classList.add("erro-ao-registrar");
    }

    if(emailValido && senhaValida) {
        mensagemDeErro.style.display = "none";
        mensagemDeSucesso.style.display = "block";

        fetch(`${API}logar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                senha
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error === "USER_NOT_FOUND" || data.error === "INVALID_PASSWORD") {
                // Tratando erro de usuário não encontrado
                mensagemDeSucesso.style.display = "none";
                mensagemDeErro.style.display = "block";
                emailInput.focus();
            } else if(data.error) {
                // Tratando caso aconteça algum outro erro
            } else {
                if (data.token) {
                    localStorage.setItem('jwtToken', data.token);
                    window.location.href = '/';
                } else {
                    console.error('Token não encontrado na resposta do servidor');
                }

            }
        })
        .catch(error => {
              // Erro não identificado de login
              console.error('Erro ao realizar o login:', error);
        });
    }
});

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