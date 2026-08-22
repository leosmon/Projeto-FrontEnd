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

  const inputConfirmarSenha = document.getElementById("confirmarSenha");

if (senha !== confirmarSenha) {
  inputConfirmarSenha.setCustomValidity("As senhas não conferem");
  inputConfirmarSenha.reportValidity();
  localStorage.clear();
  return;
} else {
  inputConfirmarSenha.setCustomValidity(""); // limpa erro
}

  // Captura checkboxes
  const tiposCadastro = [];
  if (document.getElementById("venda").checked) tiposCadastro.push("venda");
  if (document.getElementById("troca").checked) tiposCadastro.push("troca");
  if (document.getElementById("compra").checked) tiposCadastro.push("compra");
  if (document.getElementById("leitura").checked) tiposCadastro.push("leitura");

  // Validações básicas (exemplo)
  if (senha !== confirmarSenha) {
    alert("As senhas não conferem!");
    return;
  }

  // Cria objeto JSON com todos os dados
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
    tiposCadastro
  };

  // Salva no LocalStorage como JSON
  localStorage.setItem("cadastro", JSON.stringify(dados));

  console.log("Cadastro salvo:", dados);
});


document.getElementById("cep").addEventListener("blur", () => {
  const cep = document.getElementById("cep").value.replace(/\D/g, "");
  if (cep.length === 8) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(res => res.json())
      .then(data => {
        const inputCep = document.getElementById("cep");
        if (!data.erro) {
          inputCep.setCustomValidity(""); // limpa erro
          document.getElementById("rua").value = data.logradouro;
          document.getElementById("bairro").value = data.bairro;
          document.getElementById("cidade").value = data.localidade;
          document.getElementById("estado").value = data.uf;
        } else {
          inputCep.setCustomValidity("CEP não encontrado");
          inputCep.reportValidity(); // mostra o balão de erro
        }
      });
  }
});

