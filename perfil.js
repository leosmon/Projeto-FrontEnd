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




//ss

async function carregarObras() {
  const obras = [

    { titulo: "Dune", link:"Dune.html"}
 
  ];

  const container = document.getElementById("carrosel-livros-pg-perfil");
  container.innerHTML = "";

  for (const obra of obras) {
    try {
      const resposta = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(obra.titulo)}&limit=1`);
      const dados = await resposta.json();

      if (dados.docs.length > 0) {
        const livro = dados.docs[0];
        const titulo = livro.title;
        const autor = livro.author_name ? livro.author_name[0] : "Autor desconhecido";
        const capaId = livro.cover_i;
        const capaUrl = capaId
          ? `https://covers.openlibrary.org/b/id/${capaId}-M.jpg`
          : "https://via.placeholder.com/150x210?text=Sem+Capa";

        // Cria card como link
        const card = document.createElement("a");
        card.href = obra.link; // página de destino
        card.className = "livro-card-perfil";
        card.innerHTML = `
          <div class="livro-capa-perfil">
            <img src="${capaUrl}" alt="Capa ${titulo}">
            <div class="livro-overlay-perfil"></div>
          </div>
          <div class="livro-info-perfil">
            <p class="titulo-perfil">${titulo}</p>
            <p class="autor-perfil">${autor}</p>

           <span> <p class="star">★★★★☆</p></span>
          </div>
        `;
        container.appendChild(card);
      }
    } catch (erro) {
      console.error("Erro ao carregar obra:", obra, erro);
    }
  }
}

carregarObras();

let posicao = 0;
const container = document.getElementById("carrosel-livros-pg-perfil");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const indicadores = document.getElementById("indicadores");

function atualizarIndicadores(totalSlides) {
  indicadores.innerHTML = "";
  const totalGrupos = Math.ceil(totalSlides / 3); // grupos de 3 livros
  for (let i = 0; i < totalGrupos; i++) {
    const bolinha = document.createElement("button");
    bolinha.className = i === posicao ? "ativo" : "inativo";
    bolinha.addEventListener("click", () => {
      posicao = i;
      container.style.transform = `translateX(-${posicao * 100}%)`;
      atualizarIndicadores(totalSlides);
    });
    indicadores.appendChild(bolinha);
  }
}

btnPrev.addEventListener("click", () => {
  if (posicao > 0) {
    posicao--;
    container.style.transform = `translateX(-${posicao * 100}%)`;
    atualizarIndicadores(container.children.length);
  }
});

btnNext.addEventListener("click", () => {
  const totalGrupos = Math.ceil(container.children.length / 3);
  if (posicao < totalGrupos - 1) {
    posicao++;
    container.style.transform = `translateX(-${posicao * 100}%)`;
    atualizarIndicadores(container.children.length);
  }
});

// Inicializa indicadores depois de carregar os livros
function iniciarCarrossel() {
  atualizarIndicadores(container.children.length);
}






