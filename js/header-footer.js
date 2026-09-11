

   //-----------------------------//
    // CARREGA O HEADER NAS PAGINAS////
    //-----------------------------//
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


   //-----------------------------//
    // BOTÕES DE ACESSIBILIDADE////
    //-----------------------------//
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
    //-----------------------------//
    // BOTÕES DE ACESSIBILIDADE////
    //-----------------------------//
    let currentSize = 16;
    const btnAumentar = document.getElementById("btn-aumentar");
    const btnDiminuir = document.getElementById("btn-diminuir");

    function aplicarTamanho() {
        document.body.style.fontSize = currentSize + "px";
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


       //-----------------------------//
    // BOTÕES DE BOTAO ALTERNAR TEMA////
    //-----------------------------//
   
    const btnTheme = document.getElementById('toggle-theme');
    const body = document.body;

    if (btnTheme) {
        // Verifica tema salvo, se estiver usando localStorage
        const temaSalvo = localStorage.getItem('tema');
        if (temaSalvo === 'dark') {
            body.classList.add('dark');
            body.classList.remove('light');
            btnTheme.textContent = '🌙';
        } else {
            body.classList.add('light');
            body.classList.remove('dark');
            btnTheme.textContent = '☀️';
        }

        btnTheme.addEventListener('click', () => {
            body.classList.toggle('dark');
            body.classList.toggle('light');

            if (body.classList.contains('dark')) {
                btnTheme.textContent = '🌙';
                localStorage.setItem('tema', 'dark');
            } else {
                btnTheme.textContent = '☀️';
                localStorage.setItem('tema', 'light');
            }
        });
    }
        //-----------------------------//
    // ESTADO DE LOGIN NO HEADER ////
    //-----------------------------//
    const logado = localStorage.getItem("logado") === "true";
    const cadastro = JSON.parse(localStorage.getItem("cadastro"));
    const nomeLogadoEl = document.getElementById("usuario-logado-nome");
    const btnLogout = document.getElementById("btn-logout");

    if (logado && cadastro) {
        document.querySelectorAll(".btn-login, .btn-cadastro").forEach(el => el.style.display = "none");

        if (nomeLogadoEl) {
            nomeLogadoEl.textContent = "Olá, " + cadastro.nome.split(" ")[0];
            nomeLogadoEl.style.display = "inline-block";
        }
        if (btnLogout) {
            btnLogout.style.display = "inline-block";
            btnLogout.addEventListener("click", () => {
                localStorage.removeItem("logado");
                window.location.href = "index.html";
            });
        }
    }
}

// carrega o footer.html no elemento com id "footer"
document.addEventListener("DOMContentLoaded", () => {
    fetch("complementos/footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;
        })
        .catch(error => console.error("Erro ao carregar footer:", error));
});