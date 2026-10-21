//-----------------------------------------------//
// BARRA DE PESQUISA DA PÁGINA INICIAL           //
// Leva para busca.html com o que foi digitado   //
//-----------------------------------------------//
document.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("search-button");
  const campoBusca = document.getElementById("search-bar-livro");
  const campoLocal = document.getElementById("search-bar-local");

  if (!botao || !campoBusca) return;

  let aviso = null;

  function mostrarAviso(texto) {
    if (!aviso) {
      aviso = document.createElement("p");
      aviso.setAttribute("role", "alert");
      aviso.style.cssText = "color:#dc2626;font-size:0.85rem;font-weight:600;margin:10px 4px 0;";
      const linha = botao.closest(".inputs");
      (linha || botao.parentElement).insertAdjacentElement("afterend", aviso);
    }
    aviso.textContent = texto;
    aviso.hidden = false;
  }

  function pesquisar() {
    const termo = campoBusca.value.trim();

    if (!termo) {
      mostrarAviso("Digite um autor, livro ou gênero para pesquisar.");
      campoBusca.setAttribute("aria-invalid", "true");
      campoBusca.focus();
      return;
    }

    const marcado = document.querySelector('input[name="tipo"]:checked');
    const params = new URLSearchParams({ q: termo, tipo: marcado ? marcado.value : "venda" });

    const local = campoLocal ? campoLocal.value.trim() : "";
    if (local) params.set("local", local);

    window.location.href = "busca.html?" + params.toString();
  }

  botao.addEventListener("click", pesquisar);

  [campoBusca, campoLocal].forEach(campo => {
    if (!campo) return;
    campo.addEventListener("keydown", (e) => {
      if (e.key === "Enter") pesquisar();
    });
  });

  campoBusca.addEventListener("input", () => {
    if (aviso) aviso.hidden = true;
    campoBusca.removeAttribute("aria-invalid");
  });
});
