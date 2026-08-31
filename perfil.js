document.addEventListener("DOMContentLoaded", () => {
  const cadastro = JSON.parse(localStorage.getItem("cadastro"));

  if (cadastro) {
    // Atualiza nome e email
    document.getElementById("perfil-nome").textContent = cadastro.nome;
    document.getElementById("perfil-email").textContent = cadastro.usuario + "@searchbook.com";

    // Esconde botões login/cadastro
    document.getElementById("btn-login").style.display = "none";
    document.getElementById("btn-cadastro").style.display = "none";
  }
});
