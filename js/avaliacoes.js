const AVALIACOES_SEED = [
  { titulo: "1984", nota: 5, comentario: "Uma obra atemporal e perturbadoramente atual. Leitura obrigatória.", usuario: "leitor_searchbook", data: "2026-08-15T10:00:00.000Z" },
  { titulo: "1984", nota: 4, comentario: "Impactante, mas um pouco pesado pra ler de uma vez.", usuario: "ana.lima", data: "2026-08-18T10:00:00.000Z" },
  { titulo: "A Revolução dos Bichos", nota: 4, comentario: "Fábula brilhante sobre poder e corrupção. Curto e impactante.", usuario: "leitor_searchbook", data: "2026-08-10T10:00:00.000Z" },
  { titulo: "Boa Noite PunPun", nota: 5, comentario: "Emocionalmente devastador. Arte e narrativa excepcionais.", usuario: "leitor_searchbook", data: "2026-08-05T10:00:00.000Z" }
];

document.addEventListener("DOMContentLoaded", () => {
  inicializarFormularioAvaliacao();
  inicializarModal();
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
    avaliacoesSalvas.unshift(novaAvaliacao);
    localStorage.setItem("avaliacoes", JSON.stringify(avaliacoesSalvas));

    form.reset();
    notaHidden.value = 0;
    atualizarEstrelasVisual(estrelas, 0);
    const avisoNota = document.getElementById("aviso-nota");
    if (avisoNota) avisoNota.remove();

    carregarAvaliacoes();
  });
}

function agruparPorLivro(avaliacoes) {
  const grupos = {};
  avaliacoes.forEach(av => {
    const chave = av.titulo.trim().toLowerCase();
    if (!grupos[chave]) {
      grupos[chave] = { titulo: av.titulo, avaliacoes: [] };
    }
    grupos[chave].avaliacoes.push(av);
  });
  return Object.values(grupos);
}

function calcularMedia(avaliacoes) {
  const soma = avaliacoes.reduce((acc, av) => acc + av.nota, 0);
  return soma / avaliacoes.length;
}

function gerarEstrelasTexto(nota) {
  const notaArredondada = Math.round(nota);
  return "★".repeat(notaArredondada) + "☆".repeat(5 - notaArredondada);
}

async function carregarAvaliacoes() {
  const container = document.getElementById("grid-avaliacoes-pagina");
  container.innerHTML = "<p class='carregando-avaliacoes'>Carregando avaliações...</p>";

  const avaliacoesUsuarios = JSON.parse(localStorage.getItem("avaliacoes")) || [];
  const todasAvaliacoes = [...avaliacoesUsuarios, ...AVALIACOES_SEED];
  const livrosAgrupados = agruparPorLivro(todasAvaliacoes);

  container.innerHTML = "";

  if (livrosAgrupados.length === 0) {
    container.innerHTML = "<p class='carregando-avaliacoes'>Nenhuma avaliação ainda. Seja o primeiro!</p>";
    return;
  }

  for (const livro of livrosAgrupados) {
    const media = calcularMedia(livro.avaliacoes);

    let capaUrl = null;
    let autor = "Autor desconhecido";
    try {
      const resposta = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(livro.titulo)}&limit=1`);
      const dados = await resposta.json();
      if (dados.docs && dados.docs.length > 0) {
        const dadosLivro = dados.docs[0];
        autor = dadosLivro.author_name ? dadosLivro.author_name[0] : autor;
        if (dadosLivro.cover_i) {
          capaUrl = `https://covers.openlibrary.org/b/id/${dadosLivro.cover_i}-M.jpg`;
        }
      }
    } catch (erro) {
      console.error("Erro ao buscar capa:", erro);
    }

    const card = document.createElement("button");
    card.type = "button";
    card.className = "avaliacao-grid-card";
    card.innerHTML = `
      <div class="avaliacao-grid-capa">
        ${capaUrl ? `<img src="${capaUrl}" alt="Capa ${livro.titulo}">` : "📘"}
      </div>
      <div class="avaliacao-grid-info">
        <strong>${livro.titulo}</strong>
        <p class="avaliacao-grid-autor">${autor}</p>
        <span class="estrelas">${gerarEstrelasTexto(media)}</span>
        <p class="avaliacao-grid-contagem">${livro.avaliacoes.length} avaliação${livro.avaliacoes.length > 1 ? "ões" : ""}</p>
      </div>
    `;

    card.addEventListener("click", () => abrirModalAvaliacoes(livro, media));
    container.appendChild(card);
  }
}

function inicializarModal() {
  const modal = document.getElementById("modal-avaliacoes-livro");
  const btnFechar = document.getElementById("btn-fechar-modal-av");

  btnFechar.addEventListener("click", () => modal.classList.remove("ativo"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("ativo");
  });
}

function abrirModalAvaliacoes(livro, media) {
  const modal = document.getElementById("modal-avaliacoes-livro");
  document.getElementById("modal-av-titulo").textContent = livro.titulo;
  document.getElementById("modal-av-media-estrelas").textContent = gerarEstrelasTexto(media);
  document.getElementById("modal-av-media-texto").textContent =
    `${media.toFixed(1)} de 5 · ${livro.avaliacoes.length} avaliação${livro.avaliacoes.length > 1 ? "ões" : ""}`;

  // Ordena as avaliações mais recentes primeiro (as "principais" ao abrir)
  const avaliacoesOrdenadas = [...livro.avaliacoes].sort((a, b) => new Date(b.data) - new Date(a.data));

  const listaEl = document.getElementById("modal-av-lista");
  listaEl.innerHTML = "";

  avaliacoesOrdenadas.forEach(av => {
    const item = document.createElement("div");
    item.className = "modal-av-item";
    const dataFormatada = new Date(av.data).toLocaleDateString("pt-BR");
    item.innerHTML = `
      <div class="modal-av-item-topo">
        <strong>@${av.usuario}</strong>
        <span class="estrelas">${gerarEstrelasTexto(av.nota)}</span>
      </div>
      <p class="modal-av-item-texto">${av.comentario}</p>
      <p class="modal-av-item-data">${dataFormatada}</p>
    `;
    listaEl.appendChild(item);
  });

  modal.classList.add("ativo");
}