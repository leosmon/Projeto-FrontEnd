document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const workKey = params.get("id"); // ex: "/works/OL262758W"

  if (!workKey) {
    mostrarErro();
    return;
  }

  carregarLivro(workKey);
});

async function carregarLivro(workKey) {
  const carregando = document.getElementById("livro-carregando");
  const conteudo = document.getElementById("livro-conteudo");

  try {
    // Detalhes da obra (sinopse, assuntos)
    const respostaObra = await fetch(`https://openlibrary.org${workKey}.json`);
    if (!respostaObra.ok) throw new Error("Obra não encontrada");
    const obra = await respostaObra.json();

    // Nome do(s) autor(es) — precisa de uma segunda chamada, pois a obra só traz a "key" do autor
    let nomeAutor = "Autor desconhecido";
    if (obra.authors && obra.authors.length > 0) {
      const autorKey = obra.authors[0].author?.key || obra.authors[0].key;
      if (autorKey) {
        try {
          const respostaAutor = await fetch(`https://openlibrary.org${autorKey}.json`);
          const dadosAutor = await respostaAutor.json();
          nomeAutor = dadosAutor.name || nomeAutor;
        } catch (e) { /* mantém "Autor desconhecido" */ }
      }
    }

    // Capa
    const capaId = obra.covers && obra.covers.length > 0 ? obra.covers[0] : null;
    const capaUrl = capaId
      ? `https://covers.openlibrary.org/b/id/${capaId}-L.jpg`
      : "https://via.placeholder.com/300x450?text=Sem+Capa";

    // Sinopse — pode vir como string OU como objeto { value: "..." }
    let sinopse = null;
    if (obra.description) {
      sinopse = typeof obra.description === "string" ? obra.description : obra.description.value;
    }

    // Preenche a página
    document.getElementById("titulo-aba").textContent = `Search Book - ${obra.title}`;
    document.getElementById("livro-titulo").textContent = obra.title;
    document.getElementById("livro-autor").textContent = nomeAutor;
    document.getElementById("livro-capa-img").src = capaUrl;
    document.getElementById("livro-capa-img").alt = `Capa de ${obra.title}`;

    if (sinopse) {
      document.getElementById("livro-sinopse").textContent = sinopse;
    }

    if (obra.first_publish_date) {
      document.getElementById("livro-publicacao").textContent = `Publicado em ${obra.first_publish_date}`;
    }

    // Assuntos/gêneros (como tags)
    const assuntosEl = document.getElementById("livro-assuntos");
    if (obra.subjects && obra.subjects.length > 0) {
      obra.subjects.slice(0, 6).forEach(assunto => {
        const tag = document.createElement("span");
        tag.className = "assunto-tag";
        tag.textContent = assunto;
        assuntosEl.appendChild(tag);
      });
    }

    document.getElementById("link-openlibrary").href = `https://openlibrary.org${workKey}`;

    carregando.style.display = "none";
    conteudo.style.display = "grid";

  } catch (erro) {
    console.error("Erro ao carregar livro:", erro);
    mostrarErro();
  }
}

function mostrarErro() {
  document.getElementById("livro-carregando").style.display = "none";
  document.getElementById("livro-erro").style.display = "block";
}