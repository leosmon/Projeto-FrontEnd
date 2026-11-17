document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form");

    // Funções auxiliares para mostrar e limpar erros embaixo do input
    function mostrarErro(inputElement, idErro, mensagem) {
        inputElement.classList.add("invalido");
        const erroDiv = document.getElementById(idErro);
        if (erroDiv) {
            erroDiv.textContent = mensagem;
            erroDiv.style.display = "block";
        }
    }

    function limparErro(inputElement, idErro) {
        inputElement.classList.remove("invalido");
        const erroDiv = document.getElementById(idErro);
        if (erroDiv) {
            erroDiv.textContent = "";
            erroDiv.style.display = "none";
        }
    }

    // Limpa o erro do campo conforme o usuário digita
    document.getElementById("nome").addEventListener("input", (e) => limparErro(e.target, "erro-nome"));
    document.getElementById("cpf").addEventListener("input", (e) => limparErro(e.target, "erro-cpf"));
    document.getElementById("cep").addEventListener("input", (e) => limparErro(e.target, "erro-cep"));
    document.getElementById("usuario").addEventListener("input", (e) => limparErro(e.target, "erro-usuario"));
    document.getElementById("senha").addEventListener("input", (e) => limparErro(e.target, "erro-senha"));
    document.getElementById("confirmarSenha").addEventListener("input", (e) => limparErro(e.target, "erro-confirmarSenha"));

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

        let formValido = true;

        // ✅ Validação do nome: 15 a 80 caracteres, apenas letras e espaços
        const inputNome = document.getElementById("nome");
        const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{15,80}$/;
        if (!nomeRegex.test(nome)) {
            mostrarErro(inputNome, "erro-nome", "Nome deve ter entre 15 e 80 letras (sem números)");
            formValido = false;
        } else {
            limparErro(inputNome, "erro-nome");
        }

        // ✅ Validação de CPF: dígito verificador
        const inputCpf = document.getElementById("cpf");
        if (!validarCPF(cpf)) {
            mostrarErro(inputCpf, "erro-cpf", "CPF inválido ou incompleto");
            formValido = false;
        } else {
            limparErro(inputCpf, "erro-cpf");
        }

        // ✅ Validação do CEP: obrigatório e com 8 dígitos limpos
        const inputCep = document.getElementById("cep");
        const cepLimpo = cep.replace(/\D/g, "");
        if (cepLimpo.length !== 8) {
            mostrarErro(inputCep, "erro-cep", "Digite um CEP válido com 8 dígitos");
            formValido = false;
        } else {
            limparErro(inputCep, "erro-cep");
        }

        // ✅ Validação de login: exatamente 6 letras
        const inputUsuario = document.getElementById("usuario");
        const usuarioRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]{6}$/;
        if (!usuarioRegex.test(usuario)) {
            mostrarErro(inputUsuario, "erro-usuario", "Usuário deve ter exatamente 6 letras");
            formValido = false;
        } else {
            limparErro(inputUsuario, "erro-usuario");
        }

        // ✅ Validação de senha: exatamente 8 letras
        const inputSenha = document.getElementById("senha");
        const senhaRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]{8}$/;
        if (!senhaRegex.test(senha)) {
            mostrarErro(inputSenha, "erro-senha", "Senha deve ter exatamente 8 letras");
            formValido = false;
        } else {
            limparErro(inputSenha, "erro-senha");
        }

        // ✅ Validação de confirmação de senha
        const inputConfirmarSenha = document.getElementById("confirmarSenha");
        if (senha !== confirmarSenha || confirmarSenha === "") {
            mostrarErro(inputConfirmarSenha, "erro-confirmarSenha", "As senhas não conferem");
            formValido = false;
        } else {
            limparErro(inputConfirmarSenha, "erro-confirmarSenha");
        }

        // Se houver algum erro, interrompe o envio aqui
        if (!formValido) return;

        // Captura checkboxes
        const tiposCadastro = [];
        if (document.querySelector("input[value='venda']")?.checked) tiposCadastro.push("venda");
        if (document.querySelector("input[value='troca']")?.checked) tiposCadastro.push("troca");
        if (document.querySelector("input[value='compra']")?.checked) tiposCadastro.push("compra");
        if (document.querySelector("input[value='leitura']")?.checked) tiposCadastro.push("leitura");

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
            dataCadastro: new Date().toISOString()
        };

        // Salva no LocalStorage com segurança
        localStorage.setItem("cadastro", JSON.stringify(dados));

        // Tela de sucesso
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

    // Busca CEP automático via ViaCEP ao sair do campo
    const inputCep = document.getElementById("cep");
    if (inputCep) {
        inputCep.addEventListener("blur", () => {
            const cepLimpo = inputCep.value.replace(/\D/g, "");
            
            if (cepLimpo.length === 8) {
                fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.erro) {
                            limparErro(inputCep, "erro-cep");
                            document.getElementById("rua").value = data.logradouro || "";
                            document.getElementById("bairro").value = data.bairro || "";
                            document.getElementById("cidade").value = data.localidade || "";
                            document.getElementById("estado").value = data.uf || "";
                        } else {
                            mostrarErro(inputCep, "erro-cep", "CEP não encontrado na base de dados");
                        }
                    })
                    .catch(() => {
                        mostrarErro(inputCep, "erro-cep", "Erro ao buscar CEP");
                    });
            } else if (cepLimpo.length > 0) {
                mostrarErro(inputCep, "erro-cep", "CEP incompleto");
            }
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