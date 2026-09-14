

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

    const wrapperUsuario = document.getElementById("usuario-logado-wrapper");
    const avatarBtn = document.getElementById("avatar-usuario");
    const avatarIniciais = document.getElementById("avatar-iniciais");
    const submenuUsuario = document.getElementById("submenu-usuario");
    const submenuNome = document.getElementById("submenu-nome-completo");
    const btnLogout = document.getElementById("btn-logout");

    if (logado && cadastro) {
        // Esconde login/cadastro, mostra o avatar
        document.querySelectorAll(".btn-login, .btn-cadastro").forEach(el => el.style.display = "none");
        if (wrapperUsuario) wrapperUsuario.style.display = "block";

        // Gera as iniciais a partir do nome (ex: "Ana Lima" → "AL")
        if (avatarIniciais && cadastro.nome) {
            const partesNome = cadastro.nome.trim().split(" ");
            const iniciais = partesNome.length > 1
                ? (partesNome[0][0] + partesNome[partesNome.length - 1][0])
                : partesNome[0].substring(0, 2);
            avatarIniciais.textContent = iniciais.toUpperCase();
        }

        if (submenuNome) submenuNome.textContent = cadastro.nome;

        // Abre/fecha o submenu ao clicar no avatar
        if (avatarBtn && submenuUsuario) {
            avatarBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                submenuUsuario.classList.toggle("aberto");
            });

            // Fecha ao clicar em qualquer outro lugar da página
            document.addEventListener("click", () => {
                submenuUsuario.classList.remove("aberto");
            });
        }

        // Logout
        if (btnLogout) {
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

    //-----------------------------//
    // SUBMENU DE CATEGORIAS ////
    //-----------------------------//
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownWrapper = document.querySelector(".item-menu-dropdown");
    if (dropdownToggle && dropdownWrapper) {
        dropdownToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownWrapper.classList.toggle("aberto");
        });
        document.addEventListener("click", () => {
            dropdownWrapper.classList.remove("aberto");
        });
    }