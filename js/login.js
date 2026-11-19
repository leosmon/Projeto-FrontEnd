const formLogin = document.querySelector("form");
const mensagemErro = document.getElementById("login-erro");

formLogin.addEventListener("submit", (event) => {
  event.preventDefault();

  const usuarioLogin = document.getElementById("usuarioLogin").value.trim();
  const senhaLogin = document.getElementById("senhaLogin").value.trim();

  // Recupera a lista de usuários cadastrados (pilha de cadastros)
  const listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (listaUsuarios.length === 0) {
    mostrarErro("Nenhum cadastro encontrado. Faça seu cadastro primeiro.");
    return;
  }

  // Procura na lista se existe um usuário correspondente
  const usuarioEncontrado = listaUsuarios.find(
    (u) => u.usuario === usuarioLogin && u.senha === senhaLogin
  );

  if (usuarioEncontrado) {
    // Marca a sessão como logada
    localStorage.setItem("logado", "true");
    
    // Salva o usuário específico que acabou de logar para o perfil ler depois
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));

    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Raleway,sans-serif;text-align:center;">
        <h1 style="color:#007BFF;">Login realizado com sucesso!</h1>
        <p style="color:#333;margin:1rem 0;">Você será redirecionado para o seu perfil em instantes...</p>
      </div>
    `;

    setTimeout(() => {
      window.location.href = "perfil.html";
    }, 3000);
  } else {
    mostrarErro("Usuário ou senha inválidos. Tente novamente.");
  }
});

function mostrarErro(texto) {
  if (mensagemErro) {
    mensagemErro.textContent = texto;
    mensagemErro.style.display = "block";
    mensagemErro.style.color = "#d9534f";
    mensagemErro.style.fontSize = "13px";
    mensagemErro.style.marginTop = "8px";
  }
}