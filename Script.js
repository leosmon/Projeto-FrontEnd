document.addEventListener("DOMContentLoaded", () => {
  let currentSize = 16; // tamanho inicial em px

  const btnAumentar = document.getElementById("btn-aumentar");
  const btnDiminuir = document.getElementById("btn-diminuir");

  function aplicarTamanho() {
    // aplica em todo o body
    document.body.style.fontSize = currentSize + "px";

    // força todos os elementos a herdarem
    document.querySelectorAll("input, textarea, select, label, button, p, h1, h2, h3, h4, h5, h6, a, span")
      .forEach(el => el.style.fontSize = currentSize + "px");
  }

  if (btnAumentar) {
    btnAumentar.addEventListener("click", () => {
      currentSize += 2;
      aplicarTamanho();
    });
  }

  if (btnDiminuir) {
    btnDiminuir.addEventListener("click", () => {
      if (currentSize > 12) {
        currentSize -= 2;
        aplicarTamanho();
      }
    });
  }
});
