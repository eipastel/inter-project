// Escutando o botão para quando o usuário der o submit
document.querySelector('.register-button').addEventListener('click', (evento) => {
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

    if(nome.length > 2 && !temNumero(nome)) {
        nomeValido = true;
        nomeInput.classList.remove("erro-ao-registrar");
    } else {
        // Tratativa caso o nome não esteja devidamente preenchido
        nomeValido = false;
        nomeInput.classList.add("erro-ao-registrar");
    }

    if(usuario.length < 3 || temEspacos(usuario)) {
        // Tratativa caso o usuário não esteja devidamente preenchido
        usuarioValido = false;
        usuarioInput.classList.add("erro-ao-registrar");
    } else {
        usuarioValido = true;
        usuarioInput.classList.remove("erro-ao-registrar");
    }

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

    if(confirmacaoSenha === senha) {
        confirmacaoSenhaValida = true;
        confirmacaoSenhaInput.classList.remove("erro-ao-registrar");
    } else {
        // Tratativa caso a confirmação de senha não esteja devidamente preenchida
        confirmacaoSenhaValida = false;
        confirmacaoSenhaInput.classList.add("erro-ao-registrar");
    }

    // Se todos os campos forem válidos, criando o usuário
    if(nomeValido && usuarioValido && emailValido && senhaValida && confirmacaoSenhaValida) {
        mensagemDeErro.style.display = "none";
        mensagemDeSucesso.style.display = "block";

        try {
            // Enviando o usuário para o backend
            fetch('https://inter-project-d39u.onrender.com/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome,
                    usuario: usuario,
                    email: email,
                    senha: senha
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