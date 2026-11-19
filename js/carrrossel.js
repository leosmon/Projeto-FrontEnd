//-----------------------------------------------//
// TABELA DE PREÇOS E SINOPSES FIXAS (SEM RANDOM) //
//-----------------------------------------------//
const PRECOS_CARROSSEL = {
  "Cem Anos de Solidão": "49.90",
  "Crime and Punishment": "44.90",
  "Moby Dick": "39.90",
  "Pride and Prejudice": "34.90",
  "The Odyssey": "37.90",
  "Brave New World": "42.90",
  "The Catcher in the Rye": "38.90",
  "War and Peace": "54.90",
  "Frankenstein": "32.90",
  "Don Quixote": "47.90"
};

const SINOPSES_CARROSSEL = {
  "Cem Anos de Solidão": "A saga da família Buendía ao longo de sete gerações na fictícia cidade de Macondo, misturando realismo mágico com reflexões sobre solidão, tempo e memória. Considerado uma das obras mais importantes da literatura latino-americana, o livro mistura fatos históricos da Colômbia com elementos fantásticos, criando um universo único que redefiniu o que a ficção podia fazer.",
  "Crime and Punishment": "Na São Petersburgo czarista, o jovem ex-estudante Raskólnikov planeja um crime que acredita ser justificado por uma teoria moral, mas é consumido pela culpa e pela tensão psicológica.",
  "Moby Dick": "A obsessiva caçada do capitão Ahab à gigantesca baleia branca Moby Dick em alto-mar, uma narrativa épica sobre destino, natureza e ambição humana.",
  "Pride and Prejudice": "Um clássico sobre relacionamentos, orgulho e primeiras impressões na Inglaterra rural, acompanhando Elizabeth Bennet e o reservado Sr. Darcy.",
  "The Odyssey": "A longa e perigosa viagem de retorno de Odisseu para casa após a Guerra de Tróia, repleta de deuses, monstros e provações.",
  "Brave New World": "Uma sociedade futurista controlada por tecnologia, condicionamento e estabilidade artificial onde a individualidade é colocada à prova.",
  "The Catcher in the Rye": "Holden Caulfield narra alguns dias de deslocamento e reflexão em Nova York, contrastando o mundo adulto com a preservação da inocência.",
  "War and Peace": "Um panorama monumental da sociedade russa durante as guerras napoleônicas, entrelaçando intrigas familiares, amor e história.",
  "Frankenstein": "Victor Frankenstein dá vida a uma criatura artificial e precisa lidar com as consequências trágicas da criação e da rejeição.",
  "Don Quixote": "As aventuras de um fidalgo que mergulha nos romances de cavalaria e parte pelo mundo ao lado de seu fiel escudeiro Sancho Pança."
};

//-----------------------------------------------//
// CONTROLADOR GENÉRICO DE CARROSSEL             //
// (reaproveitado pelos 4 carrosséis da página)  //
//-----------------------------------------------//
function criarCarrossel({ containerId, btnPrevId, btnNextId, indicadoresId, itensVisiveis = 3 }) {
  const container = document.getElementById(containerId);
  const btnPrev = document.getElementById(btnPrevId);
  const btnNext = document.getElementById(btnNextId);
  const indicadores = document.getElementById(indicadoresId);

  if (!container || !btnPrev || !btnNext || !indicadores) return null;

  const itensOriginais = Array.from(container.children);
  const totalOriginais = itensOriginais.length;

  if (totalOriginais === 0) return null;

  // Se tiver menos itens do que cabe visível, não faz sentido clonar/rolar
  if (totalOriginais <= itensVisiveis) {
    indicadores.innerHTML = "";
    btnPrev.style.display = "none";
    btnNext.style.display = "none";
    return { inicializar: () => {} };
  }
  if (totalOriginais <= itensVisiveis) {
  indicadores.innerHTML = "";
  btnPrev.style.display = "none";
  btnNext.style.display = "none";
  return { inicializar: () => {} };
}

  // Clona os últimos N itens e coloca no início, e os primeiros N no final
  const clonesFinal = itensOriginais.slice(-itensVisiveis).map(el => el.cloneNode(true));
  const clonesInicio = itensOriginais.slice(0, itensVisiveis).map(el => el.cloneNode(true));

  clonesFinal.reverse().forEach(clone => container.insertBefore(clone, container.firstChild));
  clonesInicio.forEach(clone => container.appendChild(clone));

  let posicao = itensVisiveis; // começa apontando pro primeiro item "real"
  let larguraItem = 0;

  function medir() {
    const primeiroItem = container.children[0];
    if (!primeiroItem) return;
    const rectItem = primeiroItem.getBoundingClientRect();
    const estilo = getComputedStyle(container);
    const gap = parseFloat(estilo.columnGap || estilo.gap) || 0;
    larguraItem = rectItem.width + gap;
  }

  function irPara(pos, comTransicao = true) {
    medir();
    container.style.transition = comTransicao ? "transform 0.4s ease-in-out" : "none";
    container.style.transform = `translateX(-${pos * larguraItem}px)`;
  }

  function atualizarIndicadores() {
    indicadores.innerHTML = "";
    const indiceReal = ((posicao - itensVisiveis) % totalOriginais + totalOriginais) % totalOriginais;
    const totalPaginas = Math.max(1, Math.ceil(totalOriginais / itensVisiveis));
    const paginaAtiva = Math.min(totalPaginas - 1, Math.floor(indiceReal / itensVisiveis));

    for (let i = 0; i < totalPaginas; i++) {
      const bolinha = document.createElement("button");
      bolinha.type = "button";
      bolinha.className = i === paginaAtiva ? "ativo" : "inativo";
      bolinha.setAttribute("aria-label", `Ir para grupo ${i + 1}`);
      bolinha.addEventListener("click", () => {
        posicao = itensVisiveis + (i * itensVisiveis);
        irPara(posicao, true);
        atualizarIndicadores();
      });
      indicadores.appendChild(bolinha);
    }
  }

  function inicializar() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        medir();
        irPara(posicao, false);
        atualizarIndicadores();
      });
    });
  }

  // Quando a transição termina, verifica se entrou na área clonada e "teleporta" sem transição
  container.addEventListener("transitionend", () => {
    if (posicao >= totalOriginais + itensVisiveis) {
      posicao -= totalOriginais;
      irPara(posicao, false);
      atualizarIndicadores();
    } else if (posicao < itensVisiveis) {
      posicao += totalOriginais;
      irPara(posicao, false);
      atualizarIndicadores();
    }
  });

  btnNext.addEventListener("click", () => {
    posicao++;
    irPara(posicao);
    atualizarIndicadores();
  });

  btnPrev.addEventListener("click", () => {
    posicao--;
    irPara(posicao);
    atualizarIndicadores();
  });

  // Reposiciona corretamente se a janela for redimensionada
  window.addEventListener("resize", () => {
    medir();
    irPara(posicao, false);
    atualizarIndicadores();
  });

  return { inicializar };
}

//-----------------------------------------------//
// CARD DE LIVRO PADRÃO                           //
//-----------------------------------------------//
function criarCardLivro(livro, linkFixo, preco) {
  const link = livro.workKey
    ? `livro.html?id=${encodeURIComponent(livro.workKey)}`
    : (linkFixo || "#");

  const card = document.createElement("a");
  card.href = link;
  card.className = "livro-card";
  card.innerHTML = `
    <div class="livro-capa">
      <img src="${livro.capaUrl}" alt="Capa ${livro.titulo}">
      <div class="livro-overlay"></div>
    </div>
    <div class="livro-info">
      <p class="titulo">${livro.titulo}</p>
      <p class="autor">${livro.autor}</p>
      ${preco ? `<p class="livro-preco-card">A partir de <strong>R$${preco}</strong></p>` : ""}
    </div>
  `;
  card.style.flexShrink = "0";
  return card;
}

//-----------------------------------------------//
// CARD COM HOVER DE SINOPSE + VER OFERTAS        //
// (usado no carrossel "Também precisa ler")     //
//-----------------------------------------------//
function criarCardLivroHover(livro, preco, sinopse) {
  const linkDestino = livro.workKey
    ? `livro.html?id=${encodeURIComponent(livro.workKey)}`
    : `busca.html?${new URLSearchParams({ q: livro.titulo, tipo: "venda" })}`;

  const card = document.createElement("div");
  card.className = "livro-card livro-card-interativo";
  card.style.flexShrink = "0";

  function renderNormal() {
    card.classList.remove("livro-card-destaque", "expandido-hover");
    card.innerHTML = `
      <a href="${linkDestino}" class="livro-card-link-normal">
        <div class="livro-capa">
          <img src="${livro.capaUrl}" alt="Capa ${livro.titulo}">
          <div class="livro-overlay"></div>
        </div>
        <div class="livro-info">
          <p class="titulo">${livro.titulo}</p>
          <p class="autor">${livro.autor}</p>
          <p class="livro-preco-card">A partir de <strong>R$${preco}</strong></p>
        </div>
      </a>
    `;
  }

  function renderDetalheHover() {
    card.classList.add("livro-card-destaque", "expandido-hover");
    card.innerHTML = `
      <strong class="destaque-titulo">${livro.titulo}</strong>
      <p class="destaque-sinopse">
        <span class="destaque-sinopse-texto">${sinopse}</span>
        <button class="destaque-ler-mais" type="button">Ler mais</button>
      </p>
      <p class="livro-preco-card">A partir de <strong>R$${preco}</strong></p>
      <a class="destaque-btn-oferta" href="${linkDestino}">Ver Ofertas</a>
    `;

    const btnLerMais = card.querySelector(".destaque-ler-mais");
    const textoSinopse = card.querySelector(".destaque-sinopse-texto");
    if (btnLerMais && textoSinopse) {
      btnLerMais.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const expandido = textoSinopse.classList.toggle("expandido");
        btnLerMais.textContent = expandido ? "Ler menos" : "Ler mais";
      });
    }
  }

  renderNormal();

  card.addEventListener("mouseenter", renderDetalheHover);
  card.addEventListener("mouseleave", renderNormal);

  return card;
}

async function buscarLivroPorTitulo(titulo) {
  try {
    const resposta = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(titulo)}&limit=1`);
    const dados = await resposta.json();
    if (dados.docs && dados.docs.length > 0) {
      const livro = dados.docs[0];
      return {
        titulo: livro.title || titulo,
        autor: livro.author_name ? livro.author_name[0] : "Autor desconhecido",
        capaUrl: livro.cover_i
          ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`
          : "https://via.placeholder.com/150x210?text=Sem+Capa",
        workKey: livro.key || null
      };
    }
  } catch (erro) {
    console.error("Erro ao buscar livro:", titulo, erro);
  }
  return null;
}

//-----------------------------------------------//
// CARROSSEL 1: MAIS LIDOS                        //
//-----------------------------------------------//
async function carregarMaisLidos() {
  const titulos = [
    { titulo: "jujutsu kaisen", link: "jujutsu.html" },
    { titulo: "The Hitchhiker's Guide to the Galaxy", link: "hitchhiker.html" },
    { titulo: "Harry Potter", link: "harrypotter.html" },
    { titulo: "Dune", link: "Dune.html" },
    { titulo: "bleach", link: "bleach.html" },
    { titulo: "Percy Jackson", busca: "Percy Jackson Lightning Thief" },
    { titulo: "Sapiens", busca: "The Hunger Games" },
    { titulo: "One Piece", busca: "One Piece" }
  ];

  const container = document.getElementById("carrosel-livros-pg-inicial");
  if (!container) return;

  for (const item of titulos) {
    const consultaTitulo = item.busca || item.titulo;
    const livro = await buscarLivroPorTitulo(consultaTitulo);
    if (livro) container.appendChild(criarCardLivro(livro, item.link));
  }

  // Em telas menores, reduz itens visíveis para não estourar e manter os botões ativos
  const visiveisMaisLidos = window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 3;

  const carrossel = criarCarrossel({
    containerId: "carrosel-livros-pg-inicial",
    btnPrevId: "btn-prev-mais-lidos",
    btnNextId: "btn-next-mais-lidos",
    indicadoresId: "indicadores-mais-lidos",
    itensVisiveis: 7
  });
  if (carrossel) carrossel.inicializar();
}


//-----------------------------------------------//
// CARROSSEL 2: LIVROS QUE VOCÊ TAMBÉM PRECISA LER //
//-----------------------------------------------//
async function carregarTambemPrecisa() {
  const obras = [
    {
      tituloChave: "Cem Anos de Solidão",
      busca: "One Hundred Years of Solitude"
    },
    { tituloChave: "Crime and Punishment", busca: "Crime and Punishment" },
    { tituloChave: "Moby Dick", busca: "Moby Dick" },
    { tituloChave: "Pride and Prejudice", busca: "Pride and Prejudice" },
    { tituloChave: "The Odyssey", busca: "The Odyssey" },
    { tituloChave: "Brave New World", busca: "Brave New World" },
    { tituloChave: "The Catcher in the Rye", busca: "The Catcher in the Rye" },
    { tituloChave: "War and Peace", busca: "War and Peace" },
    { tituloChave: "Frankenstein", busca: "Frankenstein" },
    { tituloChave: "Don Quixote", busca: "Don Quixote" }
  ];

  const container = document.getElementById("carrossel-tambem-precisa");
  if (!container) return;

  for (const item of obras) {
    const livro = await buscarLivroPorTitulo(item.busca);
    if (livro) {
      const preco = PRECOS_CARROSSEL[item.tituloChave] || "39.90";
      const sinopse = SINOPSES_CARROSSEL[item.tituloChave] || "Explore esta obra no catálogo do Search Book e confira as opções disponíveis.";
      container.appendChild(criarCardLivroHover(livro, preco, sinopse));
    }
  }

  const carrossel = criarCarrossel({
    containerId: "carrossel-tambem-precisa",
    btnPrevId: "btn-prev-tambem-precisa",
    btnNextId: "btn-next-tambem-precisa",
    indicadoresId: "indicadores-tambem-precisa"
  });
  if (carrossel) carrossel.inicializar();
}

//-----------------------------------------------//
// CARROSSEL 3: UNIVERSO LITERÁRIO (via subject API) //
//-----------------------------------------------//
async function carregarUniversosLiterarios() {
  const universos = [
    { nome: "Sherlock Holmes", busca: "Sherlock Holmes" },
    { nome: "A Rainha Vermelha", busca: "Red Queen" },
    { nome: "Outlander", busca: "Outlander Diana Gabaldon" },
    { nome: "Twilight", busca: "Twilight" },
    { nome: "The Witcher", busca: "The Witcher Andrzej Sapkowski" },
    { nome: "O Guia do Mochileiro das Galáxias", busca: "Hitchhiker's Guide to the Galaxy" },
    { nome: "Harry Potter", busca: "Harry Potter Philosopher's Stone" },
    { nome: "O Senhor dos Anéis", busca: "The Lord of the Rings Fellowship" },
    { nome: "Percy Jackson", busca: "Percy Jackson" },
    { nome: "Jogos Vorazes", busca: "The Hunger Games" }
  ];

  const container = document.getElementById("carrossel-universos");
  if (!container) return;

  for (const universo of universos) {
    const livro = await buscarLivroPorTitulo(universo.busca);
    const urlBusca = `busca.html?${new URLSearchParams({ q: universo.nome, tipo: "venda" })}`;

    const card = document.createElement("a");
    card.href = urlBusca;
    card.className = "autor-card";
    card.innerHTML = `
      <div class="autor-foto universo-foto">
        ${livro ? `<img src="${livro.capaUrl}" alt="${universo.nome}">` : "📚"}
      </div>
      <p class="autor-nome">${universo.nome}</p>
    `;
    card.style.flexShrink = "0";
    container.appendChild(card);
  }

  const carrossel = criarCarrossel({
    containerId: "carrossel-universos",
    btnPrevId: "btn-prev-universos",
    btnNextId: "btn-next-universos",
    indicadoresId: "indicadores-universos",
    itensVisiveis: 8
  });
  if (carrossel) carrossel.inicializar();
}

//-----------------------------------------------//
// CARROSSEL 4: AUTORES                           //
//-----------------------------------------------//
async function buscarAutor(nome) {
  try {
    const resposta = await fetch(`https://openlibrary.org/search/authors.json?q=${encodeURIComponent(nome)}&limit=1`);
    const dados = await resposta.json();
    if (dados.docs && dados.docs.length > 0) {
      const autor = dados.docs[0];
      const chaveLimpa = autor.key ? autor.key.replace("/authors/", "") : "";
      return {
        nome: autor.name || nome,
        obraPrincipal: autor.top_work || "",
        autorKey: chaveLimpa,
        fotoUrl: autor.key
          ? `https://covers.openlibrary.org/a/olid/${autor.key}-M.jpg`
          : "https://via.placeholder.com/120x120?text=Autor"
      };
    }
  } catch (erro) {
    console.error("Erro ao buscar autor:", nome, erro);
  }
  return null;
}

function criarCardAutor(autor) {
  const params = { q: autor.nome, tipo: "venda" };
  if (/^OL\d+A$/.test(autor.autorKey || "")) {
    params.autor = autor.autorKey;
  }

  const card = document.createElement("a");
  card.href = `busca.html?${new URLSearchParams(params)}`;
  card.className = "autor-card";
  card.innerHTML = `
    <div class="autor-foto">
      <img src="${autor.fotoUrl}" alt="Foto de ${autor.nome}"
           onerror="this.style.display='none'; this.parentElement.textContent='✍️';">
    </div>
    <p class="autor-nome">${autor.nome}</p>
    ${autor.obraPrincipal ? `<p class="autor-obra">${autor.obraPrincipal}</p>` : ""}
  `;
  card.style.flexShrink = "0";
  return card;
}

async function carregarAutores() {
  const nomes = [
    "Machado de Assis", "Clarice Lispector", "George Orwell", "J. K. Rowling",
    "Gabriel García Márquez", "Jane Austen", "Fiódor Dostoiévski",
    "J.R.R. Tolkien", "Agatha Christie", "Franz Kafka"
  ];

  const container = document.getElementById("carrossel-autores");
  if (!container) return;

  for (const nome of nomes) {
    const autor = await buscarAutor(nome);
    if (autor) container.appendChild(criarCardAutor(autor));
  }

  const carrossel = criarCarrossel({
    containerId: "carrossel-autores",
    btnPrevId: "btn-prev-autores",
    btnNextId: "btn-next-autores",
    indicadoresId: "indicadores-autores",
    itensVisiveis: 7
  });
  if (carrossel) carrossel.inicializar();
}

//-----------------------------------------------//
// INICIALIZAÇÃO                                  //
//-----------------------------------------------//
document.addEventListener("DOMContentLoaded", () => {
  carregarMaisLidos();
  carregarTambemPrecisa();
  carregarUniversosLiterarios();
  carregarAutores();
});