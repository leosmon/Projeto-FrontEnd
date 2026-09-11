
    const btnToggle = document.getElementById("menu-toggle");
    const menuMobile = document.getElementById("menu-responsivo");

    btnToggle.addEventListener("click", () => {
      btnToggle.classList.toggle("active");
      menuMobile.classList.toggle("ativo");
    });
