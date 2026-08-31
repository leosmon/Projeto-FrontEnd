const formLogin = document.querySelector("form");

formLogin.addEventListener("submit", (event) => {
  event.preventDefault();

  // Captura valores digitados
  const usuarioLogin = document.getElementById("usuarioLogin").value.trim();
  const senhaLogin = document.getElementById("senhaLogin").value.trim();

  // Recupera cadastro salvo
  const cadastro = JSON.parse(localStorage.getItem("cadastro"));

  if (!cadastro) {
    alert("Nenhum cadastro encontrado. Faça seu cadastro primeiro.");
    return;
  }

  // Valida usuário e senha
  if (usuarioLogin === cadastro.usuario && senhaLogin === cadastro.senha) {
    // Tela de sucesso
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Raleway,sans-serif;text-align:center;">
        <h1 style="color:#007BFF;">Login realizado com sucesso!</h1>
        <p style="color:#333;margin:1rem 0;">Você será redirecionado para a página inicial em instantes...</p>
      </div>
    `;

    // Redireciona após 3 segundos
    setTimeout(() => {
      window.location.href = "index.html";
    }, 3000);
  } else {
    alert("Usuário ou senha inválidos. Tente novamente.");
  }
});
