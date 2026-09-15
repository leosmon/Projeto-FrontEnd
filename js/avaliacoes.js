// Avaliações fictícias iniciais (seed) — só usadas se não houver nada salvo ainda
const AVALIACOES_SEED = [
  { titulo: "1984", nota: 5, comentario: "Uma obra atemporal e perturbadoramente atual. Leitura obrigatória.", usuario: "leitor_searchbook", data: "2026-08-15T10:00:00.000Z" },
  { titulo: "A Revolução dos Bichos", nota: 4, comentario: "Fábula brilhante sobre poder e corrupção. Curto e impactante.", usuario: "leitor_searchbook", data: "2026-08-10T10:00:00.000Z" },
  { titulo: "Boa Noite PunPun", nota: 5, comentario: "Emocionalmente devastador. Arte e narrativa excepcionais.", usuario: "leitor_searchbook", data: "2026-08-05T10:00:00.000Z" }
];

document.addEventListener("DOMContentLoaded", () => {
  inicializarFormularioAvaliacao();
  carregarAvaliacoes();
});

function inicializarFormularioAvaliacao() {
  const logado = localStorage.getItem("logado") === "true";
  const secaoForm = document.getElementById("secao-nova-avaliacao");
  const avisoLogin = document.getElementById("aviso-login");

  if (logado) {
    secaoForm.style.display = "block";
  } else {
    avisoLogin.style.display = "block";
  }

  // Estrelas clicáveis
  const estrelasInput = document.getElementById("estrelas-input");
  const estrelas = estrelasInput.querySelectorAll(".estrela");
  const notaHidden = document.getElementById("av-nota");

  estrelas.forEach(estrela => {
    estrela.addEventListener("click", () => {
      const valor = parseInt(estrela.dataset.valor);
      notaHidden.value = valor;
      atualizarEstrelasVisual(estrelas, valor);
    });
  });

  function atualizarEstrelasVisual(estrelas, valor) {
    estrelas.forEach(el => {
      el.classList.toggle("selecionada", parseInt(el.dataset.valor) <= valor);
    });
  }

  const form = document.getElementById("form-nova-avaliacao");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo = document.getElementById("av-titulo").value.trim();
    const comentario = document.getElementById("av-comentario").value.trim();
    const nota = parseInt(notaHidden.value);

    if (nota === 0) {
      // Sem window.alert() — mensagem inline simples
      let avisoNota = document.getElementById("aviso-nota");
      if (!avisoNota) {
        avisoNota = document.createElement("p");
        avisoNota.id = "aviso-nota";
        avisoNota.className = "aviso-nota-vazia";
        avisoNota.textContent = "Selecione uma nota de 1 a 5 estrelas antes de publicar.";
        form.insertBefore(avisoNota, form.querySelector("button"));
      }
      return;
    }

    const cadastro = JSON.parse(localStorage.getItem("cadastro"));
    const novaAvaliacao = {
      titulo,
      nota,
      comentario,
      usuario: cadastro ? cadastro.usuario : "anônimo",
      data: new Date().toISOString()
    };

    const avaliacoesSalvas = JSON.parse(localStorage.getItem("avaliacoes")) || [];
    avaliacoesSalvas.unshift(novaAvaliacao); // adiciona no início (mais recente primeiro)
    localStorage.setItem("avaliacoes", JSON.stringify(avaliacoesSalvas));

    form.reset();
    notaHidden.value = 0;
    atualizarEstrelasVisual(estrelas, 0);
    const avisoNota = document.getElementById("aviso-nota");
    if (avisoNota) avisoNota.remove();

    carregarAvaliacoes(); // recarrega a lista com a nova avaliação incluída
  });
}

async function carregarAvaliacoes() {
  const container = document.getElementById("lista-avaliacoes-pagina");
  container.innerHTML = "<p class='carregando-avaliacoes'>Carregando avaliações...</p>";

  const avaliacoesUsuarios = JSON.parse(localStorage.getItem("avaliacoes")) || [];
  const todasAvaliacoes = [...avaliacoesUsuarios, ...AVALIACOES_SEED];

  container.innerHTML = "";

  for (const avaliacao of todasAvaliacoes) {
    const card = document.createElement("div");
    card.className = "avaliacao-card card";

    // Busca capa/autor do livro na Open Library
    let capaUrl = null;
    let autor = "";
    try {
      const resposta = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(avaliacao.titulo)}&limit=1`);
      const dados = await resposta.json();
      if (dados.docs && dados.docs.length > 0) {
        const livro = dados.docs[0];
        autor = livro.author_name ? livro.author_name[0] : "";
        if (livro.cover_i) {
          capaUrl = `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`;
        }
      }
    } catch (erro) {
      console.error("Erro ao buscar capa:", erro);
    }

    const estrelasHtml = "★".repeat(avaliacao.nota) + "☆".repeat(5 - avaliacao.nota);
    const dataFormatada = new Date(avaliacao.data).toLocaleDateString("pt-BR");

    card.innerHTML = `
      <div class="avaliacao-card-capa">
        ${capaUrl ? `<img src="${capaUrl}" alt="Capa ${avaliacao.titulo}">` : "📘"}
      </div>
      <div class="avaliacao-card-conteudo">
        <div class="avaliacao-topo">
          <strong>${avaliacao.titulo}</strong>
          <span class="estrelas">${estrelasHtml}</span>
        </div>
        ${autor ? `<p class="avaliacao-autor">${autor}</p>` : ""}
        <p class="avaliacao-texto">${avaliacao.comentario}</p>
        <p class="avaliacao-meta">por @${avaliacao.usuario} · ${dataFormatada}</p>
      </div>
    `;
    container.appendChild(card);
  }

  if (todasAvaliacoes.length === 0) {
    container.innerHTML = "<p class='carregando-avaliacoes'>Nenhuma avaliação ainda. Seja o primeiro!</p>";
  }
}