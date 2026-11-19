const PERFIS_SEED_PUBLICOS = {
  "ana.lima": {
    nome: "Ana Lima",
    usuario: "ana.lima",
    bio: "Leitora de clássicos, ficção científica e mangás. Sempre aberta a boas recomendações.",
    localizacao: "Rio de Janeiro, RJ",
    dataCadastro: "2024-04-10T12:00:00.000Z",
    interessesPerfil: ["Clássicos", "Ficção Científica", "Mangás"],
    leituras: [
      {
        titulo: "Dom Casmurro",
        autor: "Machado de Assis",
        progresso: 68,
        nota: 4,
        capa: ""
      }
    ],
    vendas: [
      { titulo: "1984", preco: 32.0, capa: "" },
      { titulo: "A Revolução dos Bichos", preco: 24.5, capa: "" }
    ],
    grupos: [
      { nome: "Clássicos da Literatura Brasileira", membros: 34, data: "15 Set", link: "" },
      { nome: "Ficção Científica Brasil", membros: 87, data: "20 Set", link: "" }
    ]
  },
  "pedro.matos": {
    nome: "Pedro Matos",
    usuario: "pedro.matos",
    bio: "Apaixonado por universos expandidos, fantasia épica e ensaios históricos.",
    localizacao: "São Paulo, SP",
    dataCadastro: "2025-01-20T12:00:00.000Z",
    interessesPerfil: ["Fantasia", "Ficção Científica", "História"],
    leituras: [
      {
        titulo: "Dune",
        autor: "Frank Herbert",
        progresso: 45,
        nota: 5,
        capa: ""
      }
    ],
    vendas: [
      { titulo: "Fundação", preco: 38.0, capa: "" }
    ],
    grupos: [
      { nome: "Ficção Científica Brasil", membros: 87, data: "20 Set", link: "" }
    ]
  }
};

function normalizarHandle(valor) {
  return String(valor || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/\s+/g, ".")
    .toLowerCase();
}

function obterIniciais(nome) {
  const partes = String(nome || "U").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "U";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function formatarEstrelas(nota) {
  const n = Math.max(0, Math.min(5, Math.round(Number(nota) || 4)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function formatarMembroDesde(dataRef) {
  if (!dataRef) return "🕐 Membro desde: 2024";
  const d = new Date(String(dataRef).length === 10 ? `${dataRef}T12:00:00` : dataRef);
  if (Number.isNaN(d.getTime())) return "🕐 Membro desde: 2024";
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return `🕐 Membro desde: ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function lerJsonSeguro(chave, fallback) {
  try {
    const raw = localStorage.getItem(chave);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function montarDadosCompletosUsuario(handleAlvo) {
  const usuariosSalvos = lerJsonSeguro("usuarios", []);
  const usuarioLogado = localStorage.getItem("logado") === "true"
    ? lerJsonSeguro("usuarioLogado", null)
    : null;

  const encontradoLista = Array.isArray(usuariosSalvos)
    ? usuariosSalvos.find(u => normalizarHandle(u.usuario) === handleAlvo)
    : null;

  const bateComLogado = usuarioLogado && normalizarHandle(usuarioLogado.usuario) === handleAlvo;
  const seed = PERFIS_SEED_PUBLICOS[handleAlvo] || null;

  const base = {
    ...(seed || {}),
    ...(encontradoLista || {}),
    ...(bateComLogado ? usuarioLogado : {})
  };

  if (!base.nome && !base.usuario && !seed) {
    return null;
  }

  const nomeFinal = base.nome || handleAlvo;
  const usuarioFinal = normalizarHandle(base.usuario || handleAlvo);

  // Leituras
  const leiturasPorUsuario = lerJsonSeguro("leiturasPorUsuario", {});
  let leituras = Array.isArray(leiturasPorUsuario[usuarioFinal]) ? leiturasPorUsuario[usuarioFinal] : null;
  if (!leituras && bateComLogado) {
    const leituraAtual = lerJsonSeguro("leituraAtual", null);
    if (Array.isArray(leituraAtual)) leituras = leituraAtual;
    else if (leituraAtual && leituraAtual.titulo) leituras = [leituraAtual];
  }
  if (!leituras) {
    leituras = Array.isArray(seed?.leituras) ? seed.leituras : [];
  }

  // Livros à venda
  const todasVendas = lerJsonSeguro("livrosVenda", lerJsonSeguro("livrosAVenda", []));
  const vendasDoUsuario = Array.isArray(todasVendas)
    ? todasVendas.filter(item => normalizarHandle(item.vendedor || item.usuario) === usuarioFinal)
    : [];
  const vendas = vendasDoUsuario.length > 0
    ? vendasDoUsuario
    : (Array.isArray(seed?.vendas) ? seed.vendas : []);

  // Grupos que participa
  const gruposSalvos = lerJsonSeguro("gruposLeitura", lerJsonSeguro("grupos", []));
  let grupos = [];
  if (Array.isArray(gruposSalvos) && gruposSalvos.length > 0) {
    const filtrados = gruposSalvos.filter(g => {
      if (!Array.isArray(g.membrosUsuarios)) return false;
      return g.membrosUsuarios.map(normalizarHandle).includes(usuarioFinal);
    });
    grupos = filtrados.length > 0 ? filtrados : (seed?.grupos || []);
  } else {
    grupos = seed?.grupos || [];
  }

  return {
    nome: nomeFinal,
    usuario: usuarioFinal,
    bio: base.bio || "",
    localizacao: base.localizacao || "",
    dataCadastro: base.dataCadastro || base.membroDesde || "",
    interessesPerfil: base.interessesPerfil || [],
    leituras,
    vendas,
    grupos,
    ehProprioPerfil: Boolean(bateComLogado)
  };
}

function renderizarLeituras(leituras) {
  const container = document.getElementById("visita-leituras");
  if (!container) return;
  container.innerHTML = "";

  if (!leituras || leituras.length === 0) {
    container.innerHTML = `<p class="visita-vazio">Nenhum livro em leitura no momento.</p>`;
    return;
  }

  leituras.forEach(livro => {
    const pct = Math.max(0, Math.min(100, Number(livro.progresso) || 0));
    const card = document.createElement("div");
    card.className = "visita-leitura-item";
    card.innerHTML = `
      <div class="visita-leitura-topo">
        <div>
          <strong>${livro.titulo || "Livro"}</strong>
          <p>${livro.autor || "Autor não informado"}</p>
        </div>
        <span class="visita-estrelas">${formatarEstrelas(livro.nota)}</span>
      </div>
      <div class="visita-barra-fundo">
        <div class="visita-barra-preenchida" style="width: ${pct}%;"></div>
      </div>
      <small class="visita-pct-texto">${pct}% concluído</small>
    `;
    container.appendChild(card);
  });
}

function renderizarVendas(vendas) {
  const container = document.getElementById("visita-vendas");
  const avisoCarrinho = document.getElementById("visita-aviso-carrinho");
  if (!container) return;
  container.innerHTML = "";

  if (!vendas || vendas.length === 0) {
    container.innerHTML = `<p class="visita-vazio">Nenhum livro à venda no momento.</p>`;
    return;
  }

  vendas.forEach(item => {
    const precoNum = Number(item.preco) || 0;
    const precoFmt = precoNum.toFixed(2).replace(".", ",");
    const row = document.createElement("div");
    row.className = "visita-venda-item";
    row.innerHTML = `
      <div>
        <strong>${item.titulo || "Livro"}</strong>
        <p class="visita-preco">R$ ${precoFmt}</p>
      </div>
      <button type="button" class="visita-btn-carrinho">+ Carrinho</button>
    `;

    row.querySelector(".visita-btn-carrinho")?.addEventListener("click", () => {
      const carrinho = lerJsonSeguro("carrinho", []);
      const existente = carrinho.find(c => c.titulo === item.titulo);
      if (existente) {
        existente.quantidade = (Number(existente.quantidade) || 1) + 1;
      } else {
        carrinho.push({
          titulo: item.titulo,
          preco: precoNum,
          capa: item.capa || "",
          quantidade: 1
        });
      }
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      if (avisoCarrinho) avisoCarrinho.style.display = "block";
    });

    container.appendChild(row);
  });
}

function renderizarGrupos(grupos) {
  const container = document.getElementById("visita-grupos");
  if (!container) return;
  container.innerHTML = "";

  if (!grupos || grupos.length === 0) {
    container.innerHTML = `<p class="visita-vazio">Ainda não participa de nenhum grupo.</p>`;
    return;
  }

  grupos.forEach(grupo => {
    const row = document.createElement("div");
    row.className = "visita-grupo-item";
    const qtdMembros = grupo.membros ? `👤 ${grupo.membros} membros` : "Grupo de leitura";
    const linkHtml = grupo.link
      ? `<a href="${grupo.link}" target="_blank" rel="noopener noreferrer" class="visita-link-grupo">Abrir</a>`
      : `<span class="visita-data-grupo">${grupo.data || "Ativo"}</span>`;

    row.innerHTML = `
      <div>
        <strong>${grupo.nome || "Grupo"}</strong>
        <p>${qtdMembros}</p>
      </div>
      ${linkHtml}
    `;
    container.appendChild(row);
  });
}

function exibirNaoEncontrado(handleTentado) {
  const boxErro = document.getElementById("usuario-nao-encontrado");
  const textoErro = document.getElementById("texto-usuario-nao-encontrado");
  const sugestoesEl = document.getElementById("sugestoes-perfis");
  if (!boxErro) return;

  if (textoErro) {
    textoErro.textContent = handleTentado
      ? `Não encontramos o perfil de @${handleTentado}.`
      : "Informe um usuário na URL (ex: usuario.html?u=ana.lima).";
  }

  if (sugestoesEl) {
    const usuariosSalvos = lerJsonSeguro("usuarios", []);
    const handlesDisponiveis = new Set(Object.keys(PERFIS_SEED_PUBLICOS));
    if (Array.isArray(usuariosSalvos)) {
      usuariosSalvos.forEach(u => {
        const h = normalizarHandle(u.usuario);
        if (h) handlesDisponiveis.add(h);
      });
    }

    sugestoesEl.innerHTML = "";
    Array.from(handlesDisponiveis).slice(0, 6).forEach(h => {
      const a = document.createElement("a");
      a.href = `usuario.html?u=${encodeURIComponent(h)}`;
      a.className = "chip-perfil-sugerido";
      a.textContent = `@${h}`;
      sugestoesEl.appendChild(a);
    });
  }

  boxErro.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const paramRaw = params.get("u") || params.get("usuario") || "";
  let handleAlvo = normalizarHandle(paramRaw);

  if (!handleAlvo && localStorage.getItem("logado") === "true") {
    const logadoObj = lerJsonSeguro("usuarioLogado", null);
    if (logadoObj?.usuario) handleAlvo = normalizarHandle(logadoObj.usuario);
  }

  const dados = handleAlvo ? montarDadosCompletosUsuario(handleAlvo) : null;
  if (!dados) {
    exibirNaoEncontrado(handleAlvo);
    return;
  }

  document.getElementById("titulo-aba-usuario").textContent = `Search Book - ${dados.nome} (@${dados.usuario})`;
  document.getElementById("visita-nome").textContent = dados.nome;
  document.getElementById("visita-handle").textContent = `@${dados.usuario}`;
  document.getElementById("visita-avatar").textContent = obterIniciais(dados.nome);
  document.getElementById("visita-membro").textContent = formatarMembroDesde(dados.dataCadastro);

  const badgeEl = document.getElementById("visita-badge");
  if (badgeEl) {
    badgeEl.textContent = dados.ehProprioPerfil ? "Seu perfil público" : "Visualizando leitor";
  }

  const bioEl = document.getElementById("visita-bio");
  if (bioEl) {
    bioEl.textContent = dados.bio ? `“${dados.bio}”` : "";
    bioEl.style.display = dados.bio ? "block" : "none";
  }

  const metaEl = document.getElementById("visita-meta");
  if (metaEl) {
    const interesses = Array.isArray(dados.interessesPerfil)
      ? dados.interessesPerfil
      : String(dados.interessesPerfil || "").split(",").map(s => s.trim()).filter(Boolean);
    const partes = [];
    if (dados.localizacao) partes.push(`📍 ${dados.localizacao}`);
    if (interesses.length) partes.push(`🏷️ ${interesses.join(", ")}`);
    metaEl.textContent = partes.join("  •  ");
    metaEl.style.display = partes.length ? "block" : "none";
  }

  renderizarLeituras(dados.leituras);
  renderizarVendas(dados.vendas);
  renderizarGrupos(dados.grupos);

  document.getElementById("usuario-conteudo").style.display = "block";
});