// Escutando o botão para executar a ação do login
document.querySelector('.login-button').addEventListener('click', (evento) => {
    // Prevenindo o efeito padrão de envio do formulário
    evento.preventDefault();

    // Variáveis iniciais
    let emailInput = document.getElementById('email');
    let senhaInput = document.getElementById('senha');

    // Valores dos campos
    let email = emailInput.value;
    let senha = senhaInput.value;

    // Validando se os campos estão preenchidos corretamente
    let emailValido = false;
    let senhaValida = false;

    if(email.length >= 9) {
        emailValido = true;
    } else {
        // Tratativa caso o e-mail não esteja devidamente preenchido
        emailValido = false;
    }

    if(senha.length > 2) {
        senhaValida = true;
    } else {
        // Tratativa caso a senha não esteja devidamente preenchida
        senhaValida = false;
    }

    if(emailValido && senhaValida) {
        fetch('https://inter-project-d39u.onrender.com/logar', {
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
            if (data.error === "USER_NOT_FOUND") {
                // Tratando erro de usuário não encontrado
                emailInput.focus();
            } else if(data.error === "INVALID_PASSWORD") {
                // Tratando erro de senha incorreta
                senhaInput.focus();
            } else if(data.error) {
                console.error(data.error);
            } else {
                if (data.token) {
                    localStorage.setItem('jwtToken', data.token);
                    setInterval(() => {
                        window.location.href = '/';
                    }, 1000);

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