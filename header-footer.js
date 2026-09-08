document.addEventListener("DOMContentLoaded", () => {
    fetch("complementos/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;

            // Só aqui os elementos existem → adiciona os eventos
            inicializarHeader();
        })
        .catch(error => console.error("Erro ao carregar header:", error));
});

function inicializarHeader() {
    // Botão hamburguer
    const menuToggle = document.getElementById("menu-toggle");
    const menuResponsivo = document.getElementById("menu-responsivo");
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("active");
            menuResponsivo.classList.toggle("ativo");
        });
    }

    // Botões acessibilidade
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
};


//carrega o foter.html no elemento com id "footer"
document.addEventListener("DOMContentLoaded", () => {
    fetch("complementos/footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        })
        .catch(error => console.error("Erro ao carregar footer:", error));
});
