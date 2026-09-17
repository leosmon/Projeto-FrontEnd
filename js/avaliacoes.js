const AVALIACOES_SEED = [
  {
    titulo: "1984",
    nota: 5,
    comentario: "Uma obra atemporal e perturbadoramente atual. Leitura obrigatória.",
    sinopse: "Em uma sociedade totalitária vigiada pelo Grande Irmão, Winston Smith trabalha reescrevendo a história e começa a questionar o regime que controla até seus pensamentos.",
    usuario: "leitor_searchbook",
    data: "2026-08-15T10:00:00.000Z"
  },
  {
    titulo: "1984",
    nota: 4,
    comentario: "Impactante, mas um pouco pesado pra ler de uma vez.",
    sinopse: "Em uma sociedade totalitária vigiada pelo Grande Irmão, Winston Smith trabalha reescrevendo a história e começa a questionar o regime que controla até seus pensamentos.",
    usuario: "ana.lima",
    data: "2026-08-18T10:00:00.000Z"
  },
  {
    titulo: "A Revolução dos Bichos",
    nota: 4,
    comentario: "Fábula brilhante sobre poder e corrupção. Curto e impactante.",
    sinopse: "Os animais de uma fazenda expulsam os humanos e tentam construir uma sociedade igualitária — até que os porcos no poder começam a se comportar como os antigos donos.",
    usuario: "leitor_searchbook",
    data: "2026-08-10T10:00:00.000Z"
  },
  {
    titulo: "Boa Noite PunPun",
    nota: 5,
    comentario: "Emocionalmente devastador. Arte e narrativa excepcionais.",
    sinopse: "Punpun Onodera é um garoto comum cuja infância desmorona aos poucos, em uma história que mistura realismo cru com uma arte surreal e simbólica.",
    usuario: "leitor_searchbook",
    data: "2026-08-05T10:00:00.000Z"
  },
  {
    titulo: "Dom Casmurro",
    nota: 4,
    comentario: "A ambiguidade da narrativa é genial — você nunca tem certeza se pode confiar no Bentinho.",
    sinopse: "Bentinho narra, já velho, sua obsessão pelo ciúme que sentiu de Capitu, sua esposa, levantando dúvidas que ficam sem resposta definitiva até o fim.",
    usuario: "carlos.reis",
    data: "2026-08-20T10:00:00.000Z"
  },
  {
    titulo: "O Alquimista",
    nota: 4,
    comentario: "Simples e inspirador, ótimo pra quem está pensando em mudar de vida.",
    sinopse: "O pastor Santiago viaja da Espanha ao Egito em busca de um tesouro anunciado em um sonho, descobrindo pelo caminho o que realmente significa realizar seus sonhos.",
    usuario: "mariana.souza",
    data: "2026-08-22T10:00:00.000Z"
  },
  {
    titulo: "Sapiens",
    nota: 5,
    comentario: "Muda completamente a forma como você enxerga a história da humanidade.",
    sinopse: "Uma análise da trajetória da nossa espécie, das revoluções cognitiva e agrícola até a era da informação, explorando como mitos e cooperação moldaram civilizações.",
    usuario: "leitor_searchbook",
    data: "2026-08-25T10:00:00.000Z"
  },
  {
    titulo: "Duna",
    nota: 5,
    comentario: "Construção de mundo impressionante. Ficção científica no seu melhor.",
    sinopse: "No planeta deserto Arrakis, Paul Atreides se vê no centro de uma disputa por controle da especiaria mais valiosa do universo, enquanto descobre seu próprio destino.",
    usuario: "pedro.matos",
    data: "2026-08-27T10:00:00.000Z"
  },
  {
    titulo: "Harry Potter e a Pedra Filosofal",
    nota: 5,
    comentario: "Reli depois de anos e continua mágico do mesmo jeito.",
    sinopse: "No seu décimo primeiro aniversário, Harry Potter descobre que é um bruxo e é convidado a estudar em Hogwarts, onde enfrenta seu primeiro grande mistério.",
    usuario: "ana.lima",
    data: "2026-08-28T10:00:00.000Z"
  },
  {
    titulo: "O Pequeno Príncipe",
    nota: 5,
    comentario: "Curto, mas fica na cabeça por dias. Releio todo ano.",
    sinopse: "Um piloto perdido no deserto do Saara encontra um pequeno príncipe vindo de outro planeta, que compartilha reflexões sobre amor, perda e o que realmente importa na vida.",
    usuario: "carlos.reis",
    data: "2026-08-29T10:00:00.000Z"
  },
  {
    titulo: "Cem Anos de Solidão",
    nota: 4,
    comentario: "Denso e cheio de personagens, mas vale muito o esforço.",
    sinopse: "A saga da família Buendía ao longo de sete gerações na fictícia cidade de Macondo, misturando realismo mágico com reflexões sobre solidão e repetição da história.",
    usuario: "mariana.souza",
    data: "2026-08-30T10:00:00.000Z"
  },
  {
    titulo: "O Hobbit",
    nota: 4,
    comentario: "Aventura leve e divertida, ótima porta de entrada pra fantasia.",
    sinopse: "O hobbit Bilbo Bolseiro é convocado por um grupo de anões para uma jornada até a Montanha Solitária, em busca de um tesouro guardado pelo dragão Smaug.",
    usuario: "pedro.matos",
    data: "2026-09-01T10:00:00.000Z"
  },
  {
    titulo: "A Menina que Roubava Livros",
    nota: 5,
    comentario: "A narrativa em primeira pessoa da Morte torna essa história única.",
    sinopse: "Durante a Alemanha nazista, Liesel Meminger encontra consolo em livros roubados, enquanto a Morte narra sua história com uma perspectiva inesperada sobre guerra e humanidade.",
    usuario: "ana.lima",
    data: "2026-09-02T10:00:00.000Z"
  }
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
      grupos[chave] = { titulo: av.titulo, sinopse: av.sinopse || "", avaliacoes: [] };
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

  // ✅ Sinopse do livro
  const sinopseEl = document.getElementById("modal-av-sinopse");
  if (livro.sinopse) {
    sinopseEl.textContent = livro.sinopse;
    sinopseEl.style.display = "block";
  } else {
    sinopseEl.style.display = "none";
  }

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