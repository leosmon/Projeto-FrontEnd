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

  // Clona os últimos N itens e coloca no início, e os primeiros N no final
  const clonesFinal = itensOriginais.slice(-itensVisiveis).map(el => el.cloneNode(true));
  const clonesInicio = itensOriginais.slice(0, itensVisiveis).map(el => el.cloneNode(true));

  clonesFinal.reverse().forEach(clone => container.insertBefore(clone, container.firstChild));
  clonesInicio.forEach(clone => container.appendChild(clone));

  let posicao = itensVisiveis; // começa apontando pro primeiro item "real"
    let larguraItem = 0;

  function medir() {
    // getBoundingClientRect é mais confiável que offsetWidth em cenários de layout ainda "assentando"
    const primeiroItem = container.children[0];
    const rectItem = primeiroItem.getBoundingClientRect();
    const estilo = getComputedStyle(container);
    const gap = parseFloat(estilo.columnGap || estilo.gap) || 0;
    larguraItem = rectItem.width + gap;
  }

  function irPara(pos, comTransicao = true) {
    // remedimos antes de cada movimento — corrige qualquer medição inicial errada
    medir();
    container.style.transition = comTransicao ? "transform 0.4s ease-in-out" : "none";
    container.style.transform = `translateX(-${pos * larguraItem}px)`;
  }

  function inicializar() {
    // espera 2 frames pra garantir que o navegador já calculou o layout (imagens, fontes, etc.)
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
    } else if (posicao < itensVisiveis) {
      posicao += totalOriginais;
      irPara(posicao, false);
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

  function inicializar() {
    medir();
    irPara(posicao, false);
    atualizarIndicadores();
  }

  // Reposiciona corretamente se a janela for redimensionada (larguras mudam em telas menores)
  window.addEventListener("resize", () => {
    medir();
    irPara(posicao, false);
  });

  return { inicializar };
}

//-----------------------------------------------//
// CARD DE LIVRO (usado nos 3 carrosséis de livros) //
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

// Card especial de destaque (primeiro item do carrossel "Também precisa ler")
function criarCardDestaque(item) {
  const card = document.createElement("div");
  card.className = "livro-card-destaque";
  card.innerHTML = `
    <strong class="destaque-titulo">${item.titulo}</strong>
    <p class="destaque-sinopse">
      <span class="destaque-sinopse-texto">${item.sinopse}</span>
      <button class="destaque-ler-mais" type="button">Ler mais</button>
    </p>
    <p class="livro-preco-card">A partir de <strong>R$${item.preco}</strong></p>
    <button class="destaque-btn-oferta" type="button">Ver Ofertas</button>
  `;
   card.style.flexShrink = "0";

  // Expande/recolhe a sinopse ao clicar em "Ler mais"
  const btnLerMais = card.querySelector(".destaque-ler-mais");
  const textoSinopse = card.querySelector(".destaque-sinopse-texto");
  btnLerMais.addEventListener("click", () => {
    const expandido = textoSinopse.classList.toggle("expandido");
    btnLerMais.textContent = expandido ? "Ler menos" : "Ler mais";
  });

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
        workKey: livro.key || null // ✅ ex: "/works/OL262758W"
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
    { titulo: "Sapiens", busca: "The Hunger Games" }
  ];

  const container = document.getElementById("carrosel-livros-pg-inicial");
  if (!container) return;

  for (const item of titulos) {
    const livro = await buscarLivroPorTitulo(item.titulo);
    if (livro) container.appendChild(criarCardLivro(livro, item.link));
  }

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
  // O primeiro item é o card de destaque, com sinopse própria
  const destaque = {
    titulo: "Cem Anos de Solidão",
    sinopse: "A saga da família Buendía ao longo de sete gerações na fictícia cidade de Macondo, misturando realismo mágico com reflexões sobre solidão, tempo e memória. Considerado uma das obras mais importantes da literatura latino-americana, o livro mistura fatos históricos da Colômbia com elementos fantásticos, criando um universo único que redefiniu o que a ficção podia fazer.",
    preco: (Math.random() * 30 + 35).toFixed(2)
  };

  const titulosRestantes = [
    "Crime and Punishment", "Moby Dick", "Pride and Prejudice", "The Odyssey",
    "Brave New World", "The Catcher in the Rye", "War and Peace",
    "Frankenstein", "Don Quixote"
  ];

  const container = document.getElementById("carrossel-tambem-precisa");
  if (!container) return;

  container.appendChild(criarCardDestaque(destaque));

  for (const titulo of titulosRestantes) {
    const livro = await buscarLivroPorTitulo(titulo);
    const preco = (Math.random() * 30 + 20).toFixed(2);
    if (livro) container.appendChild(criarCardLivro(livro, "#", preco));
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

    const card = document.createElement("div");
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
      return {
        nome: autor.name || nome,
        obraPrincipal: autor.top_work || "",
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
  const card = document.createElement("div");
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
     itensVisiveis: 7 // ajuste esse número conforme quantos cards cabem visíveis por seção
  });
if (carrossel) carrossel.inicializar();
}

//-----------------------------------------------//
// INICIALIZAÇÃO                                  //
//-----------------------------------------------//
document.addEventListener("DOMContentLoaded", () => {
  carregarMaisLidos();
  carregarTambemPrecisa();
  carregarUniversosLiterarios(); // ⬅️ nome atualizado
  carregarAutores();
});