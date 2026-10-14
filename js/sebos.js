//-----------------------------------------------//
// DADOS (fictícios, troque à vontade)           //
// recomendam: porcentagem (0-100) ou null       //
//-----------------------------------------------//
const SEBOS = [
  { nome: "Sebo Maré de Papel",       uf: "SP", cidade: "São Paulo",          desde: "2016-03-28", recomendam: 100 },
  { nome: "Sebo Lombada Azul",        uf: "SP", cidade: "Campinas",           desde: "2019-08-14", recomendam: 96 },
  { nome: "Livraria Rabisco",         uf: "SP", cidade: "Santos",             desde: "2023-08-04", recomendam: null },
  { nome: "Sebo Marca-Página",        uf: "SP", cidade: "São Caetano do Sul", desde: "2023-07-21", recomendam: null },
  { nome: "Sebo Tinta Velha",         uf: "SP", cidade: "Ribeirão Preto",     desde: "2018-01-09", recomendam: 92 },
  { nome: "Sebo Vento & Prosa",       uf: "SP", cidade: "São Paulo",          desde: "2021-05-30", recomendam: 100 },
  { nome: "Sebo Orelha de Livro",     uf: "SP", cidade: "Sorocaba",           desde: "2022-11-17", recomendam: null },
  { nome: "Sebo Canto do Leitor",     uf: "SP", cidade: "São Vicente",        desde: "2020-10-05", recomendam: 88 },

  { nome: "Sebo Entre Linhas",        uf: "RJ", cidade: "Rio de Janeiro",     desde: "2022-07-26", recomendam: null },
  { nome: "Livros do Largo",          uf: "RJ", cidade: "Niterói",            desde: "2017-04-12", recomendam: 97 },
  { nome: "Sebo Pó & Papel",          uf: "RJ", cidade: "Petrópolis",         desde: "2019-02-19", recomendam: 94 },
  { nome: "Sebo Nuvem de Letras",     uf: "RJ", cidade: "Rio de Janeiro",     desde: "2024-01-15", recomendam: null },
  { nome: "Sebo Verso Livre",         uf: "RJ", cidade: "Nova Friburgo",      desde: "2021-09-03", recomendam: 100 },
  { nome: "Livraria Ponto Final",     uf: "RJ", cidade: "Rio de Janeiro",     desde: "2015-06-22", recomendam: 90 },

  { nome: "Sebo Folhas de Outono",    uf: "MG", cidade: "Belo Horizonte",     desde: "2018-03-20", recomendam: 95 },
  { nome: "Sebo Estante Aberta",      uf: "MG", cidade: "Uberlândia",         desde: "2020-12-01", recomendam: null },
  { nome: "Sebo Biblioteca Viva",     uf: "MG", cidade: "Juiz de Fora",       desde: "2022-05-09", recomendam: 100 },
  { nome: "Sebo Sétima Arte",         uf: "MG", cidade: "Belo Horizonte",     desde: "2023-02-27", recomendam: null },

  { nome: "Sebo Rua dos Livros",      uf: "PR", cidade: "Curitiba",           desde: "2017-10-18", recomendam: 98 },
  { nome: "Sebo Capítulo Sete",       uf: "PR", cidade: "Londrina",           desde: "2021-03-11", recomendam: null },
  { nome: "Sebo Cantinho do Conto",   uf: "PR", cidade: "Maringá",            desde: "2019-07-25", recomendam: 91 },

  { nome: "Sebo Maré Alta",           uf: "SC", cidade: "Florianópolis",      desde: "2023-05-25", recomendam: 100 },
  { nome: "Sebo Páginas do Vale",     uf: "SC", cidade: "Joinville",          desde: "2020-04-06", recomendam: 93 },

  { nome: "Sebo Cerrado de Letras",   uf: "GO", cidade: "Goiânia",            desde: "2018-11-13", recomendam: 89 },
  { nome: "Sebo Ponte Literária",     uf: "GO", cidade: "Anápolis",           desde: "2022-08-29", recomendam: null },

  { nome: "Sebo Maré de Histórias",   uf: "BA", cidade: "Salvador",           desde: "2019-01-31", recomendam: 96 },
  { nome: "Sebo Recôncavo",           uf: "BA", cidade: "Feira de Santana",   desde: "2021-06-14", recomendam: null },

  { nome: "Sebo Lampião de Papel",    uf: "RS", cidade: "Porto Alegre",       desde: "2016-09-08", recomendam: 99 },
  { nome: "Sebo Serra Livros",        uf: "RS", cidade: "Caxias do Sul",      desde: "2020-02-18", recomendam: null },

  { nome: "Sebo Frevo & Prosa",       uf: "PE", cidade: "Recife",             desde: "2018-07-04", recomendam: 94 },
  { nome: "Sebo Planalto",            uf: "DF", cidade: "Brasília",           desde: "2022-03-22", recomendam: 100 }
];

const ESTADOS = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão",
  MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará",
  PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima",
  SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins"
};

const TAMANHO_PAGINA = 10;
const ESTADOS_INICIAIS = 4;

//-----------------------------------------------//
// ESTADO DA TELA                                //
//-----------------------------------------------//
const filtros = {
  termo: "",             // busca por nome ou cidade
  uf: null,              // estado selecionado
  buscaEstado: "",       // texto digitado na busca de estados
  estadosExpandido: false,
  visiveis: TAMANHO_PAGINA
};

const SEBOS_ORDENADOS = SEBOS.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

// Ordem fixa dos estados: mais sebos primeiro
const ORDEM_ESTADOS = (() => {
  const contagem = {};
  SEBOS.forEach(s => { contagem[s.uf] = (contagem[s.uf] || 0) + 1; });
  return Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a] || a.localeCompare(b));
})();

//-----------------------------------------------//
// UTILITÁRIOS                                   //
//-----------------------------------------------//
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function formatarData(iso) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function el(id) {
  return document.getElementById(id);
}

// Filtra pela busca de texto e, se pedido, também pelo estado
function filtrar({ comEstado }) {
  const termo = normalizar(filtros.termo);
  return SEBOS_ORDENADOS.filter(s => {
    if (comEstado && filtros.uf && s.uf !== filtros.uf) return false;
    if (!termo) return true;
    return normalizar(s.nome).includes(termo) || normalizar(s.cidade).includes(termo);
  });
}

function haFiltroAtivo() {
  return Boolean(filtros.termo.trim() || filtros.uf);
}

//-----------------------------------------------//
// RENDER: LISTA DE ESTADOS (radios)             //
//-----------------------------------------------//
function renderEstados() {
  const container = el("lista-estados");
  const botaoMais = el("ver-mais-estados");

  // Contagem respeita a busca de texto, mas não o estado escolhido
  const contagem = {};
  filtrar({ comEstado: false }).forEach(s => { contagem[s.uf] = (contagem[s.uf] || 0) + 1; });

  const busca = normalizar(filtros.buscaEstado);
  let lista = ORDEM_ESTADOS;

  if (busca) {
    lista = lista.filter(uf => normalizar(uf).includes(busca) || normalizar(ESTADOS[uf]).includes(busca));
  } else if (!filtros.estadosExpandido) {
    lista = lista.slice(0, ESTADOS_INICIAIS);
    if (filtros.uf && !lista.includes(filtros.uf)) lista.push(filtros.uf);
  }

  container.innerHTML = "";

  if (lista.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "estado-vazio";
    vazio.textContent = "Nenhum estado encontrado.";
    container.appendChild(vazio);
  }

  lista.forEach(uf => {
    const total = contagem[uf] || 0;

    const label = document.createElement("label");
    label.className = "estado-opcao" + (total === 0 && filtros.uf !== uf ? " desativado" : "");
    label.title = ESTADOS[uf];

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "estado";
    radio.value = uf;
    radio.checked = filtros.uf === uf;
    radio.disabled = total === 0 && filtros.uf !== uf;

    const texto = document.createElement("span");
    texto.textContent = `${uf} (${total})`;

    label.appendChild(radio);
    label.appendChild(texto);
    container.appendChild(label);
  });

  // "Ver mais" só faz sentido sem busca de estado e se houver mais estados que o inicial
  const temMais = ORDEM_ESTADOS.length > ESTADOS_INICIAIS;
  botaoMais.hidden = !temMais || Boolean(busca);
  botaoMais.textContent = filtros.estadosExpandido ? "Ver menos estados" : "Ver mais estados";
}

//-----------------------------------------------//
// RENDER: LISTA DE SEBOS                        //
//-----------------------------------------------//
function criarLinha(sebo) {
  const linha = document.createElement("article");
  linha.className = "sebo-linha";

  const celulas = [
    { rotulo: "Sebo / livreiro", valor: sebo.nome, classe: "celula-nome" },
    { rotulo: "Estado", valor: sebo.uf, classe: "" },
    { rotulo: "Cidade", valor: sebo.cidade, classe: "" },
    { rotulo: "Membro desde", valor: formatarData(sebo.desde), classe: "" }
  ];

  celulas.forEach(c => {
    const div = document.createElement("div");
    div.className = "sebo-celula " + c.classe;
    div.setAttribute("data-rotulo", c.rotulo);
    div.textContent = c.valor;
    linha.appendChild(div);
  });

  const avaliacao = document.createElement("div");
  avaliacao.className = "sebo-celula celula-avaliacao";
  avaliacao.setAttribute("data-rotulo", "Avaliação");

  if (sebo.recomendam === null) {
    avaliacao.textContent = "Ainda não há recomendações";
  } else {
    const forte = document.createElement("strong");
    forte.textContent = `${sebo.recomendam}% `;
    avaliacao.appendChild(document.createTextNode("👍 "));
    avaliacao.appendChild(forte);
    avaliacao.appendChild(document.createTextNode("recomendam"));
  }
  linha.appendChild(avaliacao);

  return linha;
}

function renderLista() {
  const resultados = filtrar({ comEstado: true });
  const visiveis = resultados.slice(0, filtros.visiveis);

  const lista = el("sebos-lista");
  lista.innerHTML = "";
  visiveis.forEach(s => lista.appendChild(criarLinha(s)));

  // Contagem
  const total = resultados.length;
  el("sebos-contagem").textContent =
    total === 0 ? "" : `${total} ${total === 1 ? "sebo ou livreiro" : "sebos e livreiros"}`;

  // Estados auxiliares
  el("sebos-vazio").hidden = total !== 0;
  document.querySelector(".sebos-cabecalho").hidden = total === 0;
  el("btn-mais").parentElement.hidden = total <= filtros.visiveis;
  el("limpar-filtros").hidden = !haFiltroAtivo();
}

function renderTudo() {
  renderEstados();
  renderLista();
}

//-----------------------------------------------//
// EVENTOS                                       //
//-----------------------------------------------//
function aplicarBusca() {
  filtros.termo = el("busca-sebo").value;
  filtros.visiveis = TAMANHO_PAGINA;
  renderTudo();
}

function limparFiltros() {
  filtros.termo = "";
  filtros.uf = null;
  filtros.buscaEstado = "";
  filtros.visiveis = TAMANHO_PAGINA;
  el("busca-sebo").value = "";
  el("busca-estado").value = "";
  renderTudo();
}

function iniciarEventos() {
  el("btn-buscar").addEventListener("click", aplicarBusca);

  el("busca-sebo").addEventListener("keydown", (e) => {
    if (e.key === "Enter") aplicarBusca();
  });

  // Se a pessoa apagar o texto, a lista volta ao normal sem precisar clicar em BUSCAR
  el("busca-sebo").addEventListener("input", (e) => {
    if (e.target.value === "" && filtros.termo !== "") aplicarBusca();
  });

  el("busca-estado").addEventListener("input", (e) => {
    filtros.buscaEstado = e.target.value;
    renderEstados();
  });

  el("lista-estados").addEventListener("change", (e) => {
    if (e.target.name === "estado") {
      filtros.uf = e.target.value;
      filtros.visiveis = TAMANHO_PAGINA;
      renderTudo();
    }
  });

  el("ver-mais-estados").addEventListener("click", () => {
    filtros.estadosExpandido = !filtros.estadosExpandido;
    renderEstados();
  });

  el("btn-mais").addEventListener("click", () => {
    filtros.visiveis += TAMANHO_PAGINA;
    renderLista();
  });

  el("limpar-filtros").addEventListener("click", limparFiltros);
  el("vazio-limpar").addEventListener("click", limparFiltros);

  // Recolher / expandir o bloco "Estado"
  el("toggle-estado").addEventListener("click", () => {
    const botao = el("toggle-estado");
    const aberto = botao.getAttribute("aria-expanded") === "true";
    botao.setAttribute("aria-expanded", String(!aberto));
    el("bloco-estado").hidden = aberto;
    el("toggle-estado-icone").textContent = aberto ? "+" : "−";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarEventos();
  renderTudo();
});
