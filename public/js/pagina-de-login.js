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

        fetch('http://localhost:3000/logar', {
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