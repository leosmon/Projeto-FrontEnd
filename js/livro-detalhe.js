const TABELA_PRECOS_POR_ID = {
  "/works/OL262758W": 49.90
};

const TABELA_PRECOS_POR_TITULO = {
  "dune": 59.90,
  "o alquimista": 39.90,
  "the alchemist": 39.90,
  "sapiens": 54.90,
  "jujutsu kaisen": 44.90,
  "bleach": 42.90,
  "harry potter": 54.90
};

let precoAtualLivro = 44.90;
let tituloLivroAtual = "";
let modaisAvaliacaoProntos = false;

function obterPrecoDeterministico(workKey, titulo) {
  if (workKey && TABELA_PRECOS_POR_ID[workKey] !== undefined) {
    return TABELA_PRECOS_POR_ID[workKey];
  }

  const chaveTitulo = (titulo || "").trim().toLowerCase();
  if (chaveTitulo && TABELA_PRECOS_POR_TITULO[chaveTitulo] !== undefined) {
    return TABELA_PRECOS_POR_TITULO[chaveTitulo];
  }

  return 44.90;
}

function atualizarPrecoNaTela(preco) {
  precoAtualLivro = Number(preco) || 44.90;
  const precoEl = document.getElementById("livro-preco");
  if (precoEl) {
    precoEl.textContent = precoAtualLivro.toFixed(2).replace(".", ",");
  }
}

async function traduzirTexto(texto, idiomaOrigem = "en", idiomaDestino = "pt-BR") {
  if (!texto) return texto;

  try {
    const resposta = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${idiomaOrigem}|${idiomaDestino}`
    );
    const dados = await resposta.json();

    if (dados.responseStatus === 200) {
      return dados.responseData.translatedText;
    }
  } catch (erro) {
    console.error("Erro ao traduzir sinopse:", erro);
  }

  return texto;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const workKey = params.get("id");
  const precoParam = parseFloat(params.get("preco"));

  if (!Number.isNaN(precoParam) && precoParam > 0) {
    atualizarPrecoNaTela(precoParam);
  } else {
    atualizarPrecoNaTela(obterPrecoDeterministico(workKey, ""));
  }

  configurarBotaoCarrinho();
  configurarModaisAvaliacaoDetalhe();

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
    const respostaObra = await fetch(`https://openlibrary.org${workKey}.json`);
    if (!respostaObra.ok) throw new Error("Obra não encontrada");
    const obra = await respostaObra.json();

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

    const capaId = obra.covers && obra.covers.length > 0 ? obra.covers[0] : null;
    const capaUrl = capaId
      ? `https://covers.openlibrary.org/b/id/${capaId}-L.jpg`
      : "https://via.placeholder.com/300x450?text=Sem+Capa";

    let sinopse = null;
    if (obra.description) {
      sinopse = typeof obra.description === "string" ? obra.description : obra.description.value;
    }

    tituloLivroAtual = obra.title || "";
    document.getElementById("titulo-aba").textContent = `Search Book - ${obra.title}`;
    document.getElementById("livro-titulo").textContent = obra.title;
    renderizarAvaliacoesLivro(obra.title);
    document.getElementById("livro-autor").textContent = nomeAutor;
    document.getElementById("livro-capa-img").src = capaUrl;
    document.getElementById("livro-capa-img").alt = `Capa de ${obra.title}`;

    const params = new URLSearchParams(window.location.search);
    const precoParam = parseFloat(params.get("preco"));
    if (!Number.isNaN(precoParam) && precoParam > 0) {
      atualizarPrecoNaTela(precoParam);
    } else {
      atualizarPrecoNaTela(obterPrecoDeterministico(workKey, obra.title));
    }

    if (sinopse) {
      document.getElementById("livro-sinopse").textContent = "Traduzindo sinopse...";
      const sinopseTraduzida = sinopse.length > 480
        ? await traduzirSinopseLonga(sinopse)
        : await traduzirTexto(sinopse);
      document.getElementById("livro-sinopse").textContent = sinopseTraduzida;
    }

    if (obra.first_publish_date) {
      document.getElementById("livro-publicacao").textContent = `Publicado em ${obra.first_publish_date}`;
    }

    const assuntosEl = document.getElementById("livro-assuntos");
    assuntosEl.innerHTML = "";
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

function configurarBotaoCarrinho() {
  const btnCarrinho = document.getElementById("btn-adicionar-carrinho");
  const avisoCarrinho = document.getElementById("aviso-carrinho");

  if (!btnCarrinho) return;

  btnCarrinho.addEventListener("click", () => {
    const titulo = document.getElementById("livro-titulo")?.textContent.trim();
    const capa = document.getElementById("livro-capa-img")?.src || "";

    if (!titulo) return;

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const itemExistente = carrinho.find(item => item.titulo === titulo);

    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      carrinho.push({
        titulo,
        preco: precoAtualLivro,
        capa,
        quantidade: 1
      });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    if (avisoCarrinho) {
      avisoCarrinho.style.display = "block";
    }

    const textoOriginal = btnCarrinho.textContent;
    btnCarrinho.textContent = "✔ Adicionado ao Carrinho!";
    setTimeout(() => {
      btnCarrinho.textContent = textoOriginal;
    }, 2000);
  });
}

function mostrarErro() {
  document.getElementById("livro-carregando").style.display = "none";
  document.getElementById("livro-erro").style.display = "block";
}

async function traduzirSinopseLonga(texto) {
  const frases = texto.match(/[^.!?]+[.!?]+/g) || [texto];
  const blocos = [];
  let blocoAtual = "";

  frases.forEach(frase => {
    if ((blocoAtual + frase).length > 450) {
      blocos.push(blocoAtual);
      blocoAtual = frase;
    } else {
      blocoAtual += frase;
    }
  });
  if (blocoAtual) blocos.push(blocoAtual);

  const traduzidos = [];
  for (const bloco of blocos) {
    traduzidos.push(await traduzirTexto(bloco));
  }

  return traduzidos.join(" ");
}

const AVALIACOES_DETALHE_SEED = [
  {
    titulo: "1984",
    nota: 5,
    comentario: "Uma obra atemporal e perturbadoramente atual. Leitura obrigatória.",
    usuario: "leitor_searchbook",
    data: "2026-08-15T10:00:00.000Z"
  },
  {
    titulo: "1984",
    nota: 4,
    comentario: "Impactante, mas um pouco pesado pra ler de uma vez.",
    usuario: "ana.lima",
    data: "2026-08-18T10:00:00.000Z"
  },
  {
    titulo: "Dune",
    nota: 5,
    comentario: "Construção de mundo impressionante. Ficção científica no seu melhor.",
    usuario: "pedro.matos",
    data: "2026-08-27T10:00:00.000Z"
  },
  {
    titulo: "Harry Potter and the Philosopher's Stone",
    nota: 5,
    comentario: "Reli depois de anos e continua mágico do mesmo jeito.",
    usuario: "ana.lima",
    data: "2026-08-28T10:00:00.000Z"
  }
];

function normalizarTituloComparacao(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatarEstrelasDetalhe(nota) {
  const arredondada = Math.max(0, Math.min(5, Math.round(Number(nota) || 0)));
  return "★".repeat(arredondada) + "☆".repeat(5 - arredondada);
}

function obterUsuarioLogadoDetalhe() {
  const logado = localStorage.getItem("logado") === "true";
  if (!logado) return null;
  try {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || null;
  } catch (_) {
    return null;
  }
}

function obterAvaliacoesFiltradasLivro(tituloLivro) {
  const alvo = normalizarTituloComparacao(tituloLivro);
  const avaliacoesSalvas = JSON.parse(localStorage.getItem("avaliacoes")) || [];
  const todas = [...avaliacoesSalvas, ...AVALIACOES_DETALHE_SEED];

  return todas
    .filter(av => {
      const t = normalizarTituloComparacao(av.titulo);
      return t && alvo && (t === alvo || t.includes(alvo) || alvo.includes(t));
    })
    .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
}

function criarElementoAvaliacaoDetalhe(av) {
  const card = document.createElement("div");
  card.className = "livro-avaliacao-item";
  const dataFormatada = av.data ? new Date(av.data).toLocaleDateString("pt-BR") : "";

  card.innerHTML = `
    <div class="livro-av-topo">
      <strong>@${av.usuario || "leitor"}</strong>
      <span class="livro-av-estrelas">${formatarEstrelasDetalhe(av.nota)}</span>
    </div>
    <p class="livro-av-comentario">${av.comentario}</p>
    ${dataFormatada ? `<small class="livro-av-data">${dataFormatada}</small>` : ""}
  `;
  return card;
}

function atualizarBotaoAcaoAvaliacao() {
  const containerAcao = document.getElementById("livro-av-acao-usuario");
  const modalForm = document.getElementById("modal-form-av-livro");
  const erroEl = document.getElementById("erro-av-detalhe");
  if (!containerAcao) return;

  const usuario = obterUsuarioLogadoDetalhe();

  if (usuario) {
    containerAcao.innerHTML = `
      <button type="button" id="btn-abrir-form-av-livro" class="btn-deixar-av-livro">
        ✍️ Deixar sua avaliação
      </button>
    `;
    document.getElementById("btn-abrir-form-av-livro")?.addEventListener("click", () => {
      if (!obterUsuarioLogadoDetalhe()) {
        atualizarBotaoAcaoAvaliacao();
        return;
      }
      if (erroEl) {
        erroEl.style.display = "none";
        erroEl.textContent = "";
      }
      modalForm?.classList.add("ativo");
    });
  } else {
    containerAcao.innerHTML = `
      <a href="login.html" class="link-login-av-livro">
        Faça login pra deixar sua avaliação
      </a>
    `;
  }
}

function configurarModaisAvaliacaoDetalhe() {
  if (modaisAvaliacaoProntos) return;
  modaisAvaliacaoProntos = true;

  const btnVerTodas = document.getElementById("btn-ver-todas-av-livro");
  const modalTodas = document.getElementById("modal-todas-av-livro");
  const listaModalTodas = document.getElementById("modal-todas-av-lista");
  const btnFecharTodas = document.getElementById("btn-fechar-todas-av");

  const modalForm = document.getElementById("modal-form-av-livro");
  const btnFecharForm = document.getElementById("btn-fechar-form-av");
  const btnCancelarForm = document.getElementById("btn-cancelar-form-av");
  const formAv = document.getElementById("form-avaliacao-detalhe");
  const erroEl = document.getElementById("erro-av-detalhe");

  btnVerTodas?.addEventListener("click", () => {
    if (!modalTodas || !listaModalTodas) return;
    const todas = obterAvaliacoesFiltradasLivro(tituloLivroAtual);
    listaModalTodas.innerHTML = "";
    todas.forEach(av => listaModalTodas.appendChild(criarElementoAvaliacaoDetalhe(av)));
    modalTodas.classList.add("ativo");
  });

  const fecharTodas = () => modalTodas?.classList.remove("ativo");
  btnFecharTodas?.addEventListener("click", fecharTodas);
  modalTodas?.addEventListener("click", e => {
    if (e.target === modalTodas) fecharTodas();
  });

  const fecharForm = () => {
    formAv?.reset();
    if (erroEl) {
      erroEl.style.display = "none";
      erroEl.textContent = "";
    }
    modalForm?.classList.remove("ativo");
  };
  btnFecharForm?.addEventListener("click", fecharForm);
  btnCancelarForm?.addEventListener("click", fecharForm);
  modalForm?.addEventListener("click", e => {
    if (e.target === modalForm) fecharForm();
  });

  formAv?.addEventListener("submit", e => {
    e.preventDefault();
    const usuarioAtual = obterUsuarioLogadoDetalhe();
    if (!usuarioAtual) {
      if (erroEl) {
        erroEl.textContent = "Você precisa estar logado para enviar uma avaliação.";
        erroEl.style.display = "block";
      }
      return;
    }

    const nota = Number(document.getElementById("select-nota-detalhe")?.value) || 5;
    const comentario = document.getElementById("textarea-comentario-detalhe")?.value.trim() || "";

    if (!comentario) {
      if (erroEl) {
        erroEl.textContent = "Escreva um comentário antes de enviar.";
        erroEl.style.display = "block";
      }
      return;
    }

    const novaAvaliacao = {
      titulo: tituloLivroAtual || "Livro",
      nota,
      comentario,
      usuario: usuarioAtual.usuario || "leitor",
      data: new Date().toISOString()
    };

    const salvas = JSON.parse(localStorage.getItem("avaliacoes")) || [];
    salvas.push(novaAvaliacao);
    localStorage.setItem("avaliacoes", JSON.stringify(salvas));

    fecharForm();
    renderizarAvaliacoesLivro(tituloLivroAtual);
  });
}

function renderizarAvaliacoesLivro(tituloLivro) {
  const resumoEl = document.getElementById("livro-avaliacoes-resumo");
  const listaEl = document.getElementById("livro-avaliacoes-lista");
  const btnVerTodas = document.getElementById("btn-ver-todas-av-livro");
  if (!resumoEl || !listaEl) return;

  atualizarBotaoAcaoAvaliacao();

  const doLivro = obterAvaliacoesFiltradasLivro(tituloLivro);
  listaEl.innerHTML = "";

  if (doLivro.length === 0) {
    resumoEl.textContent = "Ainda não há avaliações para este livro.";
    if (btnVerTodas) btnVerTodas.style.display = "none";
    return;
  }

  const somaNotas = doLivro.reduce((acc, item) => acc + (Number(item.nota) || 0), 0);
  const media = (somaNotas / doLivro.length).toFixed(1);

  resumoEl.textContent = `${formatarEstrelasDetalhe(Math.round(Number(media)))} · ${media} de 5 (${doLivro.length} ${doLivro.length === 1 ? "avaliação" : "avaliações"})`;

  doLivro.slice(0, 3).forEach(av => {
    listaEl.appendChild(criarElementoAvaliacaoDetalhe(av));
  });

  if (btnVerTodas) {
    btnVerTodas.style.display = doLivro.length > 3 ? "inline-block" : "none";
  }
}
