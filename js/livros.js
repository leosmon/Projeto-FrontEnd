async function carregarObras() {
  const container = document.getElementById("carrosel-livros-pg-inicial");
  if (!container) return; // sai da função se a página não tiver esse carrossel

  const obras = [
    { titulo: "jujutsu kaisen", link: "jujutsu.html" },
    { titulo: "The Hitchhiker's Guide to the Galaxy", link: "hitchhiker.html" },
    { titulo: "Harry Potter", link: "harrypotter.html" },
    { titulo: "Dune", link: "Dune.html" },
    { titulo: "bleach", link: "bleach.html" }
  ];


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
        card.className = "livro-card";
        card.innerHTML = `
          <div class="livro-capa">
            <img src="${capaUrl}" alt="Capa ${titulo}">
            <div class="livro-overlay"></div>
          </div>
          <div class="livro-info">
            <p class="titulo">${titulo}</p>
            <p class="autor">${autor}</p>
            <p class="leitores">180 Leitores</p>
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
const container = document.getElementById("carrosel-livros-pg-inicial");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const indicadores = document.getElementById("indicadores");

function atualizarIndicadores(totalSlides) {
  indicadores.innerHTML = "";
  const totalGrupos = Math.ceil(totalSlides / 3);
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

// Só ativa a navegação do carrossel se os elementos existirem nessa página
if (container && btnPrev && btnNext && indicadores) {
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
}

// Inicializa indicadores depois de carregar os livros
function iniciarCarrossel() {
  atualizarIndicadores(container.children.length);
}
