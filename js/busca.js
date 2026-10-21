//-----------------------------------------------//
// CONFIGURAÇÃO                                  //
//-----------------------------------------------//
const OL = "https://openlibrary.org";
const CAMPOS = "key,title,author_name,author_key,first_publish_year,cover_i,subject,edition_count";
const LIMITE_CARGA = 48;   // quantos livros buscamos de uma vez
const POR_PAGINA = 12;     // quantos aparecem por vez na grade
const MIN_PARA_SEMELHANTES = 6; // abaixo disso, sugerimos livros semelhantes

// Gêneros: chave (usada na URL) -> nome em português e assunto na Open Library
const GENEROS = {
  ficcao:         { nome: "Ficção",              assunto: "fiction" },
  romance:        { nome: "Romance",             assunto: "romance" },
  fantasia:       { nome: "Fantasia",            assunto: "fantasy" },
  terror:         { nome: "Terror e Suspense",   assunto: "horror" },
  suspense:       { nome: "Suspense",            assunto: "thriller" },
  biografia:      { nome: "Biografia",           assunto: "biography" },
  classicos:      { nome: "Clássicos",           assunto: "classic literature" },
  autoajuda:      { nome: "Autoajuda",           assunto: "self-help" },
  infantojuvenil: { nome: "Infantojuvenil",      assunto: "juvenile literature" },
  quadrinhos:     { nome: "Quadrinhos e Mangás", assunto: "comics" },
  manga:          { nome: "Mangás",              assunto: "manga" },
  historia:       { nome: "História",            assunto: "history" },
  poesia:         { nome: "Poesia",              assunto: "poetry" },
  negocios:       { nome: "Negócios",            assunto: "business" },
  aventura:       { nome: "Aventura",            assunto: "adventure" },
  misterio:       { nome: "Mistério",            assunto: "mystery" },
  ciencia:        { nome: "Ciência",             assunto: "science" },
  filosofia:      { nome: "Filosofia",           assunto: "philosophy" },
  drama:          { nome: "Drama",               assunto: "drama" }
};
const ALIAS_GENERO = { mangas: "manga", "terror e suspense": "terror", "quadrinhos e mangas": "quadrinhos" };

// Autores usados nas sugestões quando nada é encontrado
const AUTORES_POPULARES = [
  "Machado de Assis", "Clarice Lispector", "George Orwell",
  "Jane Austen", "Agatha Christie", "J.R.R. Tolkien"
];

// Assuntos "lixo" da Open Library que não servem para sugerir livros parecidos
const ASSUNTO_IGNORADO = /accessible|protected|daisy|in library|large type|lending|overdrive|open library|new york times|nyt|bestseller|reading level|translations? into/i;

const TIPOS = {
  venda:   { nome: "Venda" },
  troca:   { nome: "Troca" },
  leitura: { nome: "Leitura" }
};

//-----------------------------------------------//
// PARÂMETROS DA URL                             //
//-----------------------------------------------//
const parametros = new URLSearchParams(window.location.search);
const consulta = (parametros.get("q") || "").trim();
const tipo = TIPOS[parametros.get("tipo")] ? parametros.get("tipo") : "venda";
const local = (parametros.get("local") || "").trim();
const autorChave = /^OL\d+A$/.test(parametros.get("autor") || "") ? parametros.get("autor") : "";
const generoUrl = GENEROS[parametros.get("genero")] ? parametros.get("genero") : "";

// Estado da tela
const estado = { livros: [], visiveis: POR_PAGINA, ordem: "relevancia" };

//-----------------------------------------------//
// UTILITÁRIOS                                   //
//-----------------------------------------------//
const $ = (id) => document.getElementById(id);

function criar(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function normalizar(texto) {
  return (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function tokensDe(texto) {
  const unicos = new Set(normalizar(texto).split(/[^a-z0-9]+/).filter(t => t.length >= 3));
  return [...unicos].slice(0, 4);
}

function generoDe(texto) {
  const n = normalizar(texto);
  const chave = GENEROS[n] ? n : ALIAS_GENERO[n];
  return chave && GENEROS[chave] ? chave : "";
}

function formatarNumero(n) {
  return n.toLocaleString("pt-BR");
}

// Preço fictício, mas estável: o mesmo livro sempre tem o mesmo valor
function precoDe(chave) {
  const n = parseInt((chave.match(/\d+/) || ["0"])[0], 10);
  return 24 + (n % 70) + 0.9;
}

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function pegar(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error("HTTP " + resposta.status);
  return resposta.json();
}

//-----------------------------------------------//
// ACESSO À OPEN LIBRARY                         //
//-----------------------------------------------//
function normalizarDoc(d) {
  return {
    key: d.key,
    titulo: d.title || "Sem título",
    autores: d.author_name || [],
    ano: d.first_publish_year || null,
    capa: d.cover_i || null,
    assuntos: d.subject || [],
    edicoes: d.edition_count || 0
  };
}

async function buscarLivros(extra, limite) {
  const p = new URLSearchParams({ ...extra, limit: String(limite), fields: CAMPOS });
  const dados = await pegar(`${OL}/search.json?${p}`);
  return {
    livros: (dados.docs || []).filter(d => d.key).map(normalizarDoc),
    total: dados.numFound || 0
  };
}

async function buscarAutores(texto, limite) {
  const p = new URLSearchParams({ q: texto, limit: String(limite) });
  const dados = await pegar(`${OL}/search/authors.json?${p}`);
  return (dados.docs || []).map(a => ({
    key: a.key,
    nome: a.name || "",
    obra: a.top_work || "",
    total: a.work_count || 0
  })).filter(a => a.key && a.nome);
}

// Mantém só autores cujo nome combina com o que foi digitado
function filtrarAutores(autores, texto) {
  const tokens = tokensDe(texto);
  if (!tokens.length) return [];
  return autores
    .map(a => {
      const nome = normalizar(a.nome);
      const acertos = tokens.filter(t => nome.includes(t)).length;
      return { ...a, pontuacao: acertos / tokens.length };
    })
    .filter(a => a.pontuacao >= 0.5 && a.total >= 2)
    .sort((a, b) => b.pontuacao - a.pontuacao || b.total - a.total)
    .slice(0, 4);
}

function escolherAssunto(assuntos) {
  return assuntos.find(a => a.length <= 40 && !ASSUNTO_IGNORADO.test(a)) || "";
}

async function buscarSemelhantes(base, excluir) {
  const assunto = escolherAssunto(base.assuntos);
  if (!assunto) return [];
  const { livros } = await buscarLivros({ subject: assunto, sort: "editions" }, 20);
  return livros.filter(l => !excluir.has(l.key)).slice(0, 8);
}

// Quando a busca exata não acha nada: procura cada palavra separadamente
async function buscarAproximado(texto) {
  const tokens = tokensDe(texto);
  if (!tokens.length) return { livros: [], autores: [] };

  const [listasLivros, listasAutores] = await Promise.all([
    Promise.all(tokens.map(t => buscarLivros({ q: t }, 16).then(r => r.livros).catch(() => []))),
    Promise.all(tokens.map(t => buscarAutores(t, 6).catch(() => [])))
  ]);

  // Livros que aparecem em mais de uma palavra ganham prioridade
  const mapa = new Map();
  listasLivros.forEach(lista => lista.forEach(livro => {
    const atual = mapa.get(livro.key) || { livro, pontos: 0 };
    atual.pontos += 1;
    mapa.set(livro.key, atual);
  }));
  const livros = [...mapa.values()]
    .sort((a, b) => b.pontos - a.pontos || b.livro.edicoes - a.livro.edicoes)
    .map(x => x.livro)
    .slice(0, 12);

  const vistos = new Set();
  const autores = listasAutores.flat()
    .filter(a => a.total >= 3 && !vistos.has(a.key) && vistos.add(a.key))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  return { livros, autores };
}

// Último recurso: sugestões gerais
async function buscarPopulares() {
  const [{ livros }, autoresBrutos] = await Promise.all([
    buscarLivros({ subject: "fiction", sort: "editions" }, 12),
    Promise.all(AUTORES_POPULARES.map(n => buscarAutores(n, 1).then(a => a[0] || null).catch(() => null)))
  ]);
  return { livros, autores: autoresBrutos.filter(Boolean) };
}

//-----------------------------------------------//
// RENDER: CARDS                                 //
//-----------------------------------------------//
function linkLivro(livro) {
  return `livro.html?id=${encodeURIComponent(livro.key)}`;
}

function criarCapa(livro) {
  const caixa = criar("a", "produto-capa");
  caixa.href = linkLivro(livro);
  caixa.setAttribute("aria-label", `Ver detalhes de ${livro.titulo}`);

  const semCapa = () => {
    caixa.textContent = "";
    caixa.appendChild(criar("span", "produto-sem-capa", livro.titulo));
  };

  if (livro.capa) {
    const img = criar("img");
    img.src = `https://covers.openlibrary.org/b/id/${livro.capa}-M.jpg`;
    img.alt = `Capa de ${livro.titulo}`;
    img.loading = "lazy";
    img.addEventListener("error", semCapa);
    caixa.appendChild(img);
  } else {
    semCapa();
  }
  return caixa;
}

function criarCardLivro(livro) {
  const card = criar("article", "produto");
  card.appendChild(criarCapa(livro));

  const info = criar("div", "produto-info");

  const titulo = criar("h3", "produto-titulo");
  const linkTitulo = criar("a", "", livro.titulo);
  linkTitulo.href = linkLivro(livro);
  titulo.appendChild(linkTitulo);
  info.appendChild(titulo);

  info.appendChild(criar("p", "produto-autor", livro.autores.length ? livro.autores.slice(0, 2).join(", ") : "Autor desconhecido"));

  const meta = [];
  if (livro.ano) meta.push(String(livro.ano));
  if (livro.edicoes) meta.push(`${formatarNumero(livro.edicoes)} ${livro.edicoes === 1 ? "edição" : "edições"}`);
  if (meta.length) info.appendChild(criar("p", "produto-meta", meta.join(" · ")));

  // O que aparece embaixo depende do tipo escolhido na busca
  if (tipo === "venda") {
    const preco = criar("p", "produto-preco");
    preco.appendChild(document.createTextNode("A partir de "));
    preco.appendChild(criar("strong", "", formatarPreco(precoDe(livro.key))));
    info.appendChild(preco);
  } else if (tipo === "troca") {
    info.appendChild(criar("span", "produto-selo troca", "Disponível para troca"));
  } else {
    info.appendChild(criar("span", "produto-selo leitura", "Em grupos de leitura"));
  }

  const botao = criar("a", "produto-btn", "Ver detalhes");
  botao.href = linkLivro(livro);
  info.appendChild(botao);

  card.appendChild(info);
  return card;
}

function criarCardAutor(autor) {
  const link = criar("a", "autor-card-busca");
  link.href = `busca.html?${new URLSearchParams({ autor: autor.key, q: autor.nome, tipo })}`;

  const foto = criar("span", "autor-foto-busca");
  const iniciais = autor.nome.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();
  const colocarIniciais = () => { foto.textContent = iniciais; };

  const img = criar("img");
  img.src = `https://covers.openlibrary.org/a/olid/${autor.key}-M.jpg?default=false`;
  img.alt = `Foto de ${autor.nome}`;
  img.loading = "lazy";
  img.addEventListener("error", () => { img.remove(); colocarIniciais(); });
  foto.appendChild(img);
  link.appendChild(foto);

  const texto = criar("span", "autor-texto-busca");
  texto.appendChild(criar("strong", "", autor.nome));
  if (autor.obra) texto.appendChild(criar("small", "", autor.obra));
  if (autor.total) texto.appendChild(criar("small", "", `${formatarNumero(autor.total)} ${autor.total === 1 ? "obra" : "obras"}`));
  link.appendChild(texto);

  return link;
}

//-----------------------------------------------//
// RENDER: PÁGINA                                //
//-----------------------------------------------//
function ordenar(lista, ordem) {
  const itens = lista.map((livro, indice) => ({ livro, indice }));
  if (ordem === "recentes") {
    itens.sort((a, b) => (b.livro.ano || 0) - (a.livro.ano || 0) || a.indice - b.indice);
  } else if (ordem === "titulo") {
    itens.sort((a, b) => a.livro.titulo.localeCompare(b.livro.titulo, "pt-BR"));
  } else if (ordem === "preco") {
    itens.sort((a, b) => precoDe(a.livro.key) - precoDe(b.livro.key) || a.indice - b.indice);
  }
  return itens.map(x => x.livro);
}

function renderGradeLivros() {
  const grade = $("grade-livros");
  grade.innerHTML = "";
  ordenar(estado.livros, estado.ordem)
    .slice(0, estado.visiveis)
    .forEach(l => grade.appendChild(criarCardLivro(l)));
  $("busca-mais").hidden = estado.visiveis >= estado.livros.length;
}

function mostrarEsqueleto() {
  const grade = $("grade-livros");
  grade.innerHTML = "";
  for (let i = 0; i < 8; i++) grade.appendChild(criar("div", "produto esqueleto"));
  $("bloco-livros").hidden = false;
  $("bloco-autores").hidden = true;
  $("bloco-semelhantes").hidden = true;
  $("busca-mais").hidden = true;
}

function mostrarAviso(texto) {
  const aviso = $("busca-aviso");
  aviso.textContent = texto || "";
  aviso.hidden = !texto;
}

function renderAutores(autores, fortes) {
  const bloco = $("bloco-autores");
  const lista = $("lista-autores");
  lista.innerHTML = "";
  bloco.hidden = autores.length === 0;
  // Autor com nome bem parecido com a busca aparece antes dos livros
  bloco.style.order = fortes ? "0" : "2";
  autores.forEach(a => lista.appendChild(criarCardAutor(a)));
}

function renderSemelhantes(livros, titulo) {
  const bloco = $("bloco-semelhantes");
  const grade = $("grade-semelhantes");
  grade.innerHTML = "";
  bloco.hidden = livros.length === 0;
  bloco.style.order = "3";
  if (titulo) $("titulo-semelhantes").textContent = titulo;
  livros.forEach(l => grade.appendChild(criarCardLivro(l)));
}

// Monta a tela com um conjunto de resultados
function renderResultado({ titulo, resumo, aviso, livros, autores = [], autoresFortes = false, tituloLivros = "Livros", ordenavel = true }) {
  $("busca-titulo").textContent = titulo;
  $("busca-resumo").textContent = resumo || "";
  mostrarAviso(aviso);

  estado.livros = livros;
  estado.visiveis = POR_PAGINA;
  $("bloco-erro").hidden = true;
  $("bloco-semelhantes").hidden = true;
  $("bloco-livros").hidden = livros.length === 0;
  $("bloco-livros").style.order = "1";
  $("titulo-livros").textContent = tituloLivros;
  $("busca-ordenar").hidden = !ordenavel || livros.length < 2;
  renderGradeLivros();
  renderAutores(autores, autoresFortes);
}

function mostrarErro() {
  $("busca-titulo").textContent = "Ops, algo deu errado";
  $("busca-resumo").textContent = "";
  mostrarAviso("");
  ["bloco-autores", "bloco-livros", "bloco-semelhantes"].forEach(id => { $(id).hidden = true; });
  $("grade-livros").innerHTML = ""; // remove o esqueleto de carregamento
  $("busca-ordenar").hidden = true;
  $("bloco-erro").hidden = false;
}

function resumoDeLivros(livros, total) {
  if (!livros.length) return "";
  const base = `${formatarNumero(total || livros.length)} ${(total || livros.length) === 1 ? "livro encontrado" : "livros encontrados"}`;
  return total > livros.length ? `${base}. Exibindo os ${formatarNumero(livros.length)} mais relevantes.` : base;
}

//-----------------------------------------------//
// MODOS DE BUSCA                                //
//-----------------------------------------------//
async function modoBusca() {
  const [resposta, autoresBrutos] = await Promise.all([
    buscarLivros({ q: consulta }, LIMITE_CARGA),
    buscarAutores(consulta, 8).catch(() => [])
  ]);
  let { livros, total } = resposta;
  const autores = filtrarAutores(autoresBrutos, consulta);

  // Nada encontrado: tenta algo parecido e, por fim, sugestões gerais
  if (livros.length === 0 && autores.length === 0) {
    return modoAproximado();
  }

  // Achou o autor mas não achou livros: mostra as obras dele
  if (livros.length === 0 && autores.length > 0) {
    const obras = await buscarLivros({ author_key: autores[0].key }, LIMITE_CARGA);
    livros = obras.livros;
    total = obras.total;
  }

  renderResultado({
    titulo: `Resultados para “${consulta}”`,
    resumo: resumoDeLivros(livros, total),
    livros,
    autores,
    autoresFortes: autores.some(a => a.pontuacao === 1)
  });

  // Poucos resultados: sugere livros do mesmo assunto
  if (livros.length > 0 && livros.length < MIN_PARA_SEMELHANTES) {
    try {
      const vistos = new Set(livros.map(l => l.key));
      renderSemelhantes(await buscarSemelhantes(livros[0], vistos), "Livros semelhantes");
    } catch (e) { /* sugestões são opcionais */ }
  }
}

async function modoAproximado() {
  const parecidos = await buscarAproximado(consulta);

  if (parecidos.livros.length || parecidos.autores.length) {
    renderResultado({
      titulo: `Não encontramos “${consulta}”`,
      resumo: "",
      aviso: "Mas encontramos livros e autores parecidos com o que você digitou:",
      livros: parecidos.livros,
      autores: parecidos.autores,
      tituloLivros: "Livros parecidos"
    });
    return;
  }

  const populares = await buscarPopulares();
  renderResultado({
    titulo: `Não encontramos “${consulta}”`,
    resumo: "",
    aviso: "Confira a ortografia ou tente outro termo. Enquanto isso, que tal começar por estes?",
    livros: populares.livros,
    autores: populares.autores,
    tituloLivros: "Sugestões para você"
  });
}

async function modoGenero(chave) {
  const genero = GENEROS[chave];
  const { livros, total } = await buscarLivros({ subject: genero.assunto, sort: "editions" }, LIMITE_CARGA);
  renderResultado({
    titulo: `Gênero: ${genero.nome}`,
    resumo: resumoDeLivros(livros, total),
    livros,
    tituloLivros: `Livros de ${genero.nome}`
  });
  if (livros.length === 0) {
    mostrarAviso("Não encontramos livros desse gênero agora. Tente outro gênero ou faça uma busca.");
  }
}

async function modoAutor() {
  const [resposta, dadosAutor] = await Promise.all([
    buscarLivros({ author_key: autorChave }, LIMITE_CARGA),
    pegar(`${OL}/authors/${autorChave}.json`).catch(() => ({}))
  ]);
  const nome = dadosAutor.name || consulta || "este autor";
  renderResultado({
    titulo: `Livros de ${nome}`,
    resumo: resumoDeLivros(resposta.livros, resposta.total),
    livros: resposta.livros,
    tituloLivros: `Obras de ${nome}`
  });
}

async function modoVazio() {
  const populares = await buscarPopulares();
  renderResultado({
    titulo: "O que você quer ler hoje?",
    resumo: "Digite um autor, livro ou gênero na barra acima. Veja algumas sugestões:",
    livros: populares.livros,
    autores: populares.autores,
    tituloLivros: "Sugestões para você",
    ordenavel: false
  });
}

async function executarBusca() {
  mostrarEsqueleto();
  $("bloco-erro").hidden = true;
  try {
    const generoTexto = generoDe(consulta);
    if (autorChave) await modoAutor();
    else if (generoUrl) await modoGenero(generoUrl);
    else if (consulta && generoTexto) await modoGenero(generoTexto);
    else if (consulta) await modoBusca();
    else await modoVazio();
  } catch (erro) {
    console.error("Erro na busca:", erro);
    mostrarErro();
  }
}

//-----------------------------------------------//
// FORMULÁRIO E EVENTOS                          //
//-----------------------------------------------//
function preencherFormulario() {
  $("busca-q").value = consulta;
  $("busca-tipo").value = tipo;
  $("busca-local").value = local;

  // Opção "Menor preço" só faz sentido para venda
  const opcaoPreco = $("busca-ordem").querySelector('option[value="preco"]');
  opcaoPreco.hidden = tipo !== "venda";
  opcaoPreco.disabled = tipo !== "venda";

  // Campo "local" da home: leva a pessoa para os sebos da região
  if (local) {
    const aviso = $("busca-local-aviso");
    aviso.appendChild(document.createTextNode("Procurando perto de "));
    aviso.appendChild(criar("strong", "", local));
    aviso.appendChild(document.createTextNode("? "));
    const link = criar("a", "", "Veja sebos e livreiros da região →");
    link.href = `SebosELivreiros.html?busca=${encodeURIComponent(local)}`;
    aviso.appendChild(link);
    aviso.hidden = false;
  }
}

function iniciarEventos() {
  $("busca-ordem").addEventListener("change", (e) => {
    estado.ordem = e.target.value;
    renderGradeLivros();
  });

  $("btn-mais").addEventListener("click", () => {
    estado.visiveis += POR_PAGINA;
    renderGradeLivros();
  });

  $("btn-tentar").addEventListener("click", executarBusca);
}

document.addEventListener("DOMContentLoaded", () => {
  preencherFormulario();
  iniciarEventos();
  executarBusca();
});
