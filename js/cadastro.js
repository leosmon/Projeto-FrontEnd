const form = document.getElementById("form");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Captura valores
    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const rua = document.getElementById("rua").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const estado = document.getElementById("estado").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const celular = document.getElementById("celular").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
        // ✅ Validação do nome: 15 a 80 caracteres, apenas letras e espaços
    const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{15,80}$/;
    const inputNome = document.getElementById("nome");
    if (!nomeRegex.test(nome)) {
        inputNome.setCustomValidity("Nome deve ter entre 15 e 80 letras (sem números)");
        inputNome.reportValidity();
        setTimeout(() => inputNome.setCustomValidity(""), 2500);
        return;
    } else {
        inputNome.setCustomValidity("");
    }

    // ✅ Validação de CPF: dígito verificador
    const inputCpf = document.getElementById("cpf");
    if (!validarCPF(cpf)) {
        inputCpf.setCustomValidity("CPF inválido");
        inputCpf.reportValidity();
        setTimeout(() => inputCpf.setCustomValidity(""), 2500);
        return;
    } else {
        inputCpf.setCustomValidity("");
    }

    // ✅ Validação de login: exatamente 6 letras
    const inputUsuario = document.getElementById("usuario");
    const usuarioRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]{6}$/;
    if (!usuarioRegex.test(usuario)) {
        inputUsuario.setCustomValidity("Usuário deve ter exatamente 6 letras");
        inputUsuario.reportValidity();
        setTimeout(() => inputUsuario.setCustomValidity(""), 2500);
        return;
    } else {
        inputUsuario.setCustomValidity("");
    }

    // ✅ Validação de senha: exatamente 8 letras
    const inputSenha = document.getElementById("senha");
    const senhaRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]{8}$/;
    if (!senhaRegex.test(senha)) {
        inputSenha.setCustomValidity("Senha deve ter exatamente 8 letras");
        inputSenha.reportValidity();
        setTimeout(() => inputSenha.setCustomValidity(""), 2500);
        return;
    } else {
        inputSenha.setCustomValidity("");
    }

    const inputConfirmarSenha = document.getElementById("confirmarSenha");

    // Validação de senha
    if (senha !== confirmarSenha) {
        inputConfirmarSenha.setCustomValidity("As senhas não conferem");
        inputConfirmarSenha.reportValidity();
        setTimeout(() => {
            inputConfirmarSenha.setCustomValidity("");
        }, 2000);
        return;
    } else {
        inputConfirmarSenha.setCustomValidity("");
    }

    // Captura checkboxes
    const tiposCadastro = [];
    if (document.querySelector("input[value='venda']").checked) tiposCadastro.push("venda");
    if (document.querySelector("input[value='troca']").checked) tiposCadastro.push("troca");
    if (document.querySelector("input[value='compra']").checked) tiposCadastro.push("compra");
    if (document.querySelector("input[value='leitura']").checked) tiposCadastro.push("leitura");

    // Cria objeto JSON
    const dados = {
        nome,
        cpf,
        cep,
        rua,
        bairro,
        cidade,
        estado,
        telefone,
        celular,
        usuario,
        senha,
        tiposCadastro,
        dataCadastro: new Date().toISOString() // data e hora do cadastro, gerada automaticamente
    };

    // Salva no LocalStorage
    localStorage.setItem("cadastro", JSON.stringify(dados));

    document.body.innerHTML = `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Raleway,sans-serif;text-align:center;">
    <h1 style="color:#ff8400;">Cadastro realizado com sucesso!</h1>
    <p style="color:#333;margin:1rem 0;">Você será redirecionado para a página inicial em instantes...</p>
  </div>
`;

    // Redireciona após 3 segundos
    setTimeout(() => {
        window.location.href = "index.html";
    }, 3000);
});

// Busca CEP automático
document.getElementById("cep").addEventListener("blur", () => {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(data => {
                const inputCep = document.getElementById("cep");
                if (!data.erro) {
                    inputCep.setCustomValidity("");
                    document.getElementById("rua").value = data.logradouro;
                    document.getElementById("bairro").value = data.bairro;
                    document.getElementById("cidade").value = data.localidade;
                    document.getElementById("estado").value = data.uf;
                } else {
                    inputCep.setCustomValidity("CEP não encontrado");
                    inputCep.reportValidity();
                }
            })
            .catch(() => {
                const inputCep = document.getElementById("cep");
                inputCep.setCustomValidity("Erro ao buscar CEP");
                inputCep.reportValidity();
            });
    }
});

// Algoritmo oficial de validação do dígito verificador do CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ""); // remove pontos e traço

    if (cpf.length !== 11) return false;

    // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}


// Algoritmo oficial de validação do dígito verificador do CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ""); // remove pontos e traço

    if (cpf.length !== 11) return false;

    // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}

