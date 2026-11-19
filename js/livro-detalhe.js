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

  return texto; // se a tradução falhar, mostra o texto original em inglês em vez de quebrar a página
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const workKey = params.get("id"); // ex: "/works/OL262758W"
  const precoParam = parseFloat(params.get("preco"));

  if (!Number.isNaN(precoParam) && precoParam > 0) {
    atualizarPrecoNaTela(precoParam);
  } else {
    atualizarPrecoNaTela(obterPrecoDeterministico(workKey, ""));
  }

  configurarBotaoCarrinho();

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
    renderizarAvaliacoesLivro(obra.title);
    document.getElementById("livro-autor").textContent = nomeAutor;
    document.getElementById("livro-capa-img").src = capaUrl;
    document.getElementById("livro-capa-img").alt = `Capa de ${obra.title}`;

    // Define o preço fixo do livro (respeitando ?preco= na URL se vier de algum link)
    const params = new URLSearchParams(window.location.search);
    const precoParam = parseFloat(params.get("preco"));
    if (!Number.isNaN(precoParam) && precoParam > 0) {
      atualizarPrecoNaTela(precoParam);
    } else {
      atualizarPrecoNaTela(obterPrecoDeterministico(workKey, obra.title));
    }

    if (sinopse) {
      document.getElementById("livro-sinopse").textContent = "Traduzindo sinopse...";

      // A API grátis tem limite de ~500 caracteres por chamada — corta em pedaços se precisar
      const sinopseTraduzida = sinopse.length > 480
        ? await traduzirSinopseLonga(sinopse)
        : await traduzirTexto(sinopse);

      document.getElementById("livro-sinopse").textContent = sinopseTraduzida;
    }

    if (obra.first_publish_date) {
      document.getElementById("livro-publicacao").textContent = `Publicado em ${obra.first_publish_date}`;
    }

    // Assuntos/gêneros (como tags)
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

// Quebra a sinopse em pedaços de até ~450 caracteres (por frase, pra não cortar no meio)
// e traduz cada pedaço separadamente, depois junta tudo de volta
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

function renderizarAvaliacoesLivro(tituloLivro) {
  const resumoEl = document.getElementById("livro-avaliacoes-resumo");
  const listaEl = document.getElementById("livro-avaliacoes-lista");
  if (!resumoEl || !listaEl) return;

  const alvo = normalizarTituloComparacao(tituloLivro);
  const avaliacoesSalvas = JSON.parse(localStorage.getItem("avaliacoes")) || [];
  const todas = [...avaliacoesSalvas, ...AVALIACOES_DETALHE_SEED];

  // Filtra avaliações cujo título bate exatamente ou contém o título do livro
  const doLivro = todas
    .filter(av => {
      const t = normalizarTituloComparacao(av.titulo);
      return t && alvo && (t === alvo || t.includes(alvo) || alvo.includes(t));
    })
    .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

  listaEl.innerHTML = "";

  if (doLivro.length === 0) {
    resumoEl.textContent = "Ainda não há avaliações para este livro.";
    return;
  }

  const somaNotas = doLivro.reduce((acc, item) => acc + (Number(item.nota) || 0), 0);
  const media = (somaNotas / doLivro.length).toFixed(1);

  resumoEl.textContent = `${formatarEstrelasDetalhe(Math.round(Number(media)))} · ${media} de 5 (${doLivro.length} ${doLivro.length === 1 ? "avaliação" : "avaliações"})`;

  doLivro.forEach(av => {
    const card = document.createElement("div");
    card.className = "livro-avaliacao-item";
    card.style.cssText = "background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px;";

    const dataFormatada = av.data ? new Date(av.data).toLocaleDateString("pt-BR") : "";

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <strong style="font-size: 14px;">@${av.usuario || "leitor"}</strong>
        <span style="color: #f59e0b; font-size: 14px;">${formatarEstrelasDetalhe(av.nota)}</span>
      </div>
      <p style="margin: 0 0 6px; font-size: 14px; line-height: 1.45;">${av.comentario}</p>
      ${dataFormatada ? `<small style="color: #64748b; font-size: 12px;">${dataFormatada}</small>` : ""}
    `;

    listaEl.appendChild(card);
  });
}