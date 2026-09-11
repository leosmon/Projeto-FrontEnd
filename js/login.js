const formLogin = document.querySelector("form");
const mensagemErro = document.getElementById("login-erro");

formLogin.addEventListener("submit", (event) => {
  event.preventDefault();

  const usuarioLogin = document.getElementById("usuarioLogin").value.trim();
  const senhaLogin = document.getElementById("senhaLogin").value.trim();

  const cadastro = JSON.parse(localStorage.getItem("cadastro"));

  if (!cadastro) {
    mostrarErro("Nenhum cadastro encontrado. Faça seu cadastro primeiro.");
    return;
  }

  if (usuarioLogin === cadastro.usuario && senhaLogin === cadastro.senha) {
    // Marca a sessão como logada (usado pelo header pra mostrar/esconder botões)
    localStorage.setItem("logado", "true");

    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Raleway,sans-serif;text-align:center;">
        <h1 style="color:#007BFF;">Login realizado com sucesso!</h1>
        <p style="color:#333;margin:1rem 0;">Você será redirecionado para a página inicial em instantes...</p>
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
  }
}