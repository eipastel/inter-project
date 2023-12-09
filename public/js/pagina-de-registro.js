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
    } else {
        // Tratativa caso o nome não esteja devidamente preenchido
        nomeValido = false;
    }

    if(usuario.length < 3 || temEspacos(usuario)) {
        // Tratativa caso o usuário não esteja devidamente preenchido
        usuarioValido = false;
    } else {
        usuarioValido = true;
    }

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

    if(confirmacaoSenha === senha) {
        confirmacaoSenhaValida = true;
    } else {
        // Tratativa caso a confirmação de senha não esteja devidamente preenchida
        confirmacaoSenhaValida = false;
    }

    // Se todos os campos forem válidos, criando o usuário
    if(nomeValido && usuarioValido && emailValido && senhaValida && confirmacaoSenhaValida) {

        try {
            // Enviando o usuário para o backend
            fetch('http://localhost:3000/registrar', {
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

                } else {
                    // Armazenando o token JWT
                    localStorage.setItem('jwtToken', data.token);

                    // Definindo um tempo de X (nesse caso 1000 = 1 segundo) segundos para redirecionar
                    // setTimeout(()=>{
                    // window.location.href = '/views/index.html'
                    // }, 1500)
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
        console.log("Informações inválidas!");
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