const PRECOS_PERFIL_FIXOS = {
  "O Alquimista": 39.90,
  "Sapiens": 54.90,
  "Duna": 59.90,
  "Dune": 59.90
};

const GRUPOS_CATALOGO = [
  { id: "classicos-br", nome: "Clássicos da Literatura Brasileira", membros: 34, data: "15 Set", link: "https://discord.com" },
  { id: "ficcao-br", nome: "Ficção Científica Brasil", membros: 87, data: "20 Set", link: "https://discord.com" },
  { id: "mangas-hq", nome: "Mangás & Quadrinhos", membros: 52, data: "18 Set", link: "https://discord.com" },
  { id: "fantasia-epica", nome: "Fantasia & RPG Literário", membros: 63, data: "25 Set", link: "https://discord.com" },
  { id: "clube-terror", nome: "Clube do Terror & Suspense", membros: 41, data: "02 Out", link: "https://discord.com" }
];

const AVALIACOES_PERFIL_PADRAO = [
  { titulo: "1984", nota: 5, comentario: "Uma obra atemporal e perturbadoramente atual. Leitura obrigatória." },
  { titulo: "A Revolução dos Bichos", nota: 4, comentario: "Fábula brilhante sobre poder e corrupção. Curto e impactante." },
  { titulo: "Boa Noite PunPun", nota: 5, comentario: "Emocionalmente devastador. Arte e narrativa excepcionais." }
];

const REGRAS_CADASTRO_PERFIL = {
  NOME_MIN: 3,
  NOME_MAX: 60,
  USUARIO_MIN: 3,
  USUARIO_MAX: 20,
  USUARIO_REGEX: /^[a-z0-9._]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SENHA_MIN: 6,
  BIO_MAX: 180
};

const HANDLES_RESERVADOS_SISTEMA = ["admin", "suporte", "searchbook"];
const LIMITE_LIVROS_CARD_VENDA = 3;

function normalizarHandleUsuario(valor) {
  return String(valor || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function obterUsuarioLogado() {
  try {
    const raw = localStorage.getItem("usuarioLogado");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    // Se houver um cadastro correspondente em "usuarios", mescla para manter dados atualizados
    const listaUsuarios = JSON.parse(localStorage.getItem("usuarios"));
    if (Array.isArray(listaUsuarios)) {
      const handle = normalizarHandleUsuario(parsed.usuario || parsed.login || parsed.email);
      const encontrado = listaUsuarios.find(u => {
        const uHandle = normalizarHandleUsuario(u.usuario || u.login);
        const uEmail = String(u.email || "").trim().toLowerCase();
        const pEmail = String(parsed.email || "").trim().toLowerCase();
        return (parsed.id && u.id === parsed.id) ||
          (handle && uHandle === handle) ||
          (pEmail && uEmail === pEmail);
      });
      if (encontrado) {
        return { ...encontrado, ...parsed };
      }
    }

    return parsed;
  } catch (_) {
    return null;
  }
}

function migrarDadosQuandoTrocarHandle(handleAntigo, handleNovo) {
  if (!handleAntigo || !handleNovo || handleAntigo === handleNovo) return;

  try {
    const leiturasPorUsuario = JSON.parse(localStorage.getItem("leiturasPorUsuario")) || {};
    if (leiturasPorUsuario[handleAntigo]) {
      leiturasPorUsuario[handleNovo] = leiturasPorUsuario[handleAntigo];
      delete leiturasPorUsuario[handleAntigo];
      localStorage.setItem("leiturasPorUsuario", JSON.stringify(leiturasPorUsuario));
    }
  } catch (_) {}

  try {
    const vendas = JSON.parse(localStorage.getItem("livrosVenda")) || [];
    if (Array.isArray(vendas)) {
      const atualizadas = vendas.map(v => {
        if (normalizarHandleUsuario(v.usuario) === handleAntigo || normalizarHandleUsuario(v.vendedor) === handleAntigo) {
          return { ...v, usuario: handleNovo, vendedor: handleNovo };
        }
        return v;
      });
      localStorage.setItem("livrosVenda", JSON.stringify(atualizadas));
    }
  } catch (_) {}

  try {
    const avaliacoes = JSON.parse(localStorage.getItem("avaliacoes")) || [];
    if (Array.isArray(avaliacoes)) {
      const atualizadas = avaliacoes.map(a =>
        normalizarHandleUsuario(a.usuario) === handleAntigo ? { ...a, usuario: handleNovo } : a
      );
      localStorage.setItem("avaliacoes", JSON.stringify(atualizadas));
    }
  } catch (_) {}

  try {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    if (Array.isArray(pedidos)) {
      const atualizados = pedidos.map(p =>
        normalizarHandleUsuario(p.usuario) === handleAntigo ? { ...p, usuario: handleNovo } : p
      );
      localStorage.setItem("pedidos", JSON.stringify(atualizados));
    }
  } catch (_) {}
}

function sincronizarLeiturasPublicas(listaLeituras, handleUsuario) {
  const handle = normalizarHandleUsuario(handleUsuario || obterUsuarioLogado()?.usuario);
  if (!handle) return;

  try {
    const leiturasPorUsuario = JSON.parse(localStorage.getItem("leiturasPorUsuario")) || {};
    leiturasPorUsuario[handle] = listaLeituras;
    localStorage.setItem("leiturasPorUsuario", JSON.stringify(leiturasPorUsuario));
  } catch (_) {}
}

function sincronizarVendasPublicas(listaVendas, handleUsuario) {
  const handle = normalizarHandleUsuario(handleUsuario || obterUsuarioLogado()?.usuario);
  if (!handle) return;

  try {
    const todasVendas = JSON.parse(localStorage.getItem("livrosVenda")) || [];
    const deOutros = Array.isArray(todasVendas)
      ? todasVendas.filter(item => {
          const dono = normalizarHandleUsuario(item.vendedor || item.usuario || "");
          return dono && dono !== handle;
        })
      : [];

    const marcadasDoUsuario = (Array.isArray(listaVendas) ? listaVendas : []).map(item => ({
      ...item,
      usuario: handle,
      vendedor: handle
    }));

    localStorage.setItem("livrosVenda", JSON.stringify([...marcadasDoUsuario, ...deOutros]));
  } catch (_) {}
}

function salvarUsuarioLogado(dadosAtualizados) {
  const atual = obterUsuarioLogado() || {};
  const handleAntigo = normalizarHandleUsuario(atual.usuario);
  const handleNovo = normalizarHandleUsuario(dadosAtualizados.usuario || atual.usuario);

  const merged = {
    ...atual,
    ...dadosAtualizados,
    ...(handleNovo ? { usuario: handleNovo, id: atual.id || handleNovo } : {})
  };

  localStorage.setItem("usuarioLogado", JSON.stringify(merged));

  const listaUsuarios = JSON.parse(localStorage.getItem("usuarios"));
  if (Array.isArray(listaUsuarios)) {
    const idx = listaUsuarios.findIndex(
      u => (u.id && u.id === merged.id) || normalizarHandleUsuario(u.usuario) === handleAntigo || normalizarHandleUsuario(u.usuario) === handleNovo
    );
    if (idx >= 0) {
      listaUsuarios[idx] = { ...listaUsuarios[idx], ...merged };
      localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));
    }
  }

  if (handleAntigo && handleNovo && handleAntigo !== handleNovo) {
    migrarDadosQuandoTrocarHandle(handleAntigo, handleNovo);
  }

  if (Array.isArray(merged.leituraAtualLista)) {
    sincronizarLeiturasPublicas(merged.leituraAtualLista, merged.usuario);
  }

  if (Array.isArray(merged.livrosVenda)) {
    sincronizarVendasPublicas(merged.livrosVenda, merged.usuario);
  }

  return merged;
}

function gerarIniciaisNome(nome) {
  if (!nome) return "--";
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length > 1) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
}

function gerarEstrelas(nota) {
  const arredondada = Math.max(0, Math.min(5, Math.round(Number(nota) || 0)));
  return "★".repeat(arredondada) + "☆".repeat(5 - arredondada);
}

function calcularProgressoLeitura(titulo, paginaAtual, totalPaginas) {
  const pag = Number(paginaAtual);
  const tot = Number(totalPaginas);

  if (pag > 0 && tot > 0) {
    return Math.max(1, Math.min(100, Math.round((pag / tot) * 100)));
  }

  const baseTexto = `${(titulo || "").toLowerCase()}-${pag || 0}`;
  let hash = 0;
  for (let i = 0; i < baseTexto.length; i++) {
    hash = (hash * 31 + baseTexto.charCodeAt(i)) % 85;
  }
  return 15 + hash;
}

function atualizarCabecalhoPerfil(usuario) {
  if (!usuario) return;

  const nomeEl = document.getElementById("perfil-nome");
  const emailEl = document.getElementById("perfil-email");
  const avatarEl = document.getElementById("perfil-avatar-iniciais");
  const membroEl = document.getElementById("perfil-membro");
  const bioEl = document.getElementById("perfil-bio");
  const metaEl = document.getElementById("perfil-meta");

  const nomeExibido = usuario.nome || usuario.nomeCompleto || usuario.usuario || "Usuário";
  const handleLimpo = normalizarHandleUsuario(usuario.usuario || usuario.login || "");

  if (nomeEl) nomeEl.textContent = nomeExibido;
  if (emailEl) {
    const handle = handleLimpo ? `@${handleLimpo}` : "";
    const partesContato = [handle, usuario.email].filter(Boolean);
    emailEl.textContent = partesContato.join(" • ") || "@usuario";
  }
  if (avatarEl) avatarEl.textContent = gerarIniciaisNome(nomeExibido);

  const dataRef = usuario.dataCadastro || usuario.membroDesde;
  if (membroEl && dataRef) {
    const data = new Date(String(dataRef).length === 10 ? `${dataRef}T12:00:00` : dataRef);
    if (!Number.isNaN(data.getTime())) {
      const mesesPtBr = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      membroEl.textContent = `🕐 Membro desde: ${mesesPtBr[data.getMonth()]} de ${data.getFullYear()}`;
    }
  }

  if (bioEl) {
    bioEl.textContent = usuario.bio ? `“${usuario.bio}”` : "";
    bioEl.style.display = usuario.bio ? "block" : "none";
  }

  if (metaEl) {
    const interessesLista = Array.isArray(usuario.interessesPerfil)
      ? usuario.interessesPerfil
      : (typeof usuario.interessesPerfil === "string"
          ? usuario.interessesPerfil.split(",").map(s => s.trim()).filter(Boolean)
          : []);

    const partesMeta = [];
    if (usuario.localizacao) partesMeta.push(`📍 ${usuario.localizacao}`);
    if (usuario.telefone) partesMeta.push(`📞 ${usuario.telefone}`);
    if (interessesLista.length) partesMeta.push(`🏷️ ${interessesLista.join(", ")}`);

    metaEl.textContent = partesMeta.join("  |  ");
    metaEl.style.display = partesMeta.length ? "block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = obterUsuarioLogado();
  const logadoFlag = localStorage.getItem("logado");

  // Só redireciona se não houver nenhum usuário logado
  if (!usuarioLogado || logadoFlag === "false") {
    window.location.href = "login.html";
    return;
  }

  if (logadoFlag !== "true") {
    localStorage.setItem("logado", "true");
  }

  const leiturasIniciais = Array.isArray(usuarioLogado.leituraAtualLista) && usuarioLogado.leituraAtualLista.length
    ? usuarioLogado.leituraAtualLista.slice(0, 2)
    : [
        usuarioLogado.leituraAtual || {
          titulo: "Dune",
          autor: "Frank Herbert",
          paginaAtual: 204,
          totalPaginas: 300,
          progresso: 68
        }
      ];

  const inicializado = salvarUsuarioLogado({
    leituraAtualLista: leiturasIniciais,
    livrosVenda: Array.isArray(usuarioLogado.livrosVenda) && usuarioLogado.livrosVenda.length
      ? usuarioLogado.livrosVenda
      : [
          { titulo: "O Alquimista", preco: PRECOS_PERFIL_FIXOS["O Alquimista"] },
          { titulo: "Sapiens", preco: PRECOS_PERFIL_FIXOS["Sapiens"] },
          { titulo: "Duna", preco: PRECOS_PERFIL_FIXOS["Duna"] }
        ],
    gruposIds: Array.isArray(usuarioLogado.gruposIds) && usuarioLogado.gruposIds.length
      ? usuarioLogado.gruposIds
      : ["classicos-br", "ficcao-br", "mangas-hq"],
    gruposCustom: Array.isArray(usuarioLogado.gruposCustom) ? usuarioLogado.gruposCustom : []
  });

  atualizarCabecalhoPerfil(inicializado);
  carregarLeiturasAtuais();
  carregarLivrosVenda();
  renderAvaliacoesPerfil();
  renderGruposPerfil();
  carregarMeusFeedbacks();

  inicializarModalEditarPerfil();
  inicializarModalLeitura();
  inicializarModalAdicionarLivro();
  inicializarModalTodosVenda();
  inicializarModalGrupos();
  inicializarBotoesCards();
  inicializarFormularioFeedback();
});

// 1. LENDO NO MOMENTO
async function carregarLeiturasAtuais() {
  const usuario = obterUsuarioLogado();
  const leituras = (usuario?.leituraAtualLista || []).slice(0, 2);
  const card = document.getElementById("btn-ver-mais-leitura")?.closest(".card");
  if (!card) return;

  card.querySelectorAll(".bloco-leitura-dinamico").forEach(el => el.remove());

  const corpoAntigo = card.querySelector(".livro-atual");
  const progAntigo = card.querySelector(".progresso-container");
  if (corpoAntigo) corpoAntigo.style.display = "none";
  if (progAntigo) progAntigo.style.display = "none";

  const botaoVerMais = document.getElementById("btn-ver-mais-leitura");

  for (let i = 0; i < leituras.length; i++) {
    const item = leituras[i];
    const progresso = item.progresso ?? calcularProgressoLeitura(item.titulo, item.paginaAtual, item.totalPaginas);
    const infoPaginas = item.paginaAtual
      ? (item.totalPaginas ? `Pág. ${item.paginaAtual}/${item.totalPaginas}` : `Pág. ${item.paginaAtual}`)
      : "Leitura em andamento";

    let capaUrl = "";
    let autorExibido = item.autor || "Autor desconhecido";

    try {
      const resp = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(item.titulo)}&limit=1`);
      const dados = await resp.json();
      if (dados.docs && dados.docs.length > 0) {
        const doc = dados.docs[0];
        if (!item.autor && doc.author_name && doc.author_name[0]) {
          autorExibido = doc.author_name[0];
        }
        if (doc.cover_i) {
          capaUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
        }
      }
    } catch (e) {
      console.error("Erro ao buscar capa da leitura:", e);
    }

    const wrapper = document.createElement("div");
    wrapper.className = "bloco-leitura-dinamico";
    if (i > 0) {
      wrapper.style.cssText = "border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 6px;";
    }

    wrapper.innerHTML = `
      <div class="livro-atual" style="margin-bottom: 12px;">
        <div class="capa-atual" style="${capaUrl ? `background-image: url('${capaUrl}');` : ""}"></div>
        <div class="livro-atual-info">
          <strong>${item.titulo}</strong>
          <p>${autorExibido}</p>
          <span style="font-size: 12px; color: #64748b;">${infoPaginas}</span>
        </div>
      </div>
      <div class="progresso-container" style="margin-bottom: 14px;">
        <div class="progresso-topo">
          <span>Progresso</span>
          <span class="progresso-porcentagem">${progresso}%</span>
        </div>
        <div class="barra-progresso-fundo">
          <div class="barra-progresso-preenchida" style="width: ${progresso}%;"></div>
        </div>
      </div>
    `;

    card.insertBefore(wrapper, botaoVerMais);
  }
}

function preencherCamposModalLeitura(slotIndex) {
  const usuario = obterUsuarioLogado() || {};
  const lista = usuario.leituraAtualLista || [];
  const atual = lista[slotIndex] || {
    titulo: "",
    autor: "",
    paginaAtual: 50,
    totalPaginas: 250,
    progresso: 20
  };

  const tituloInput = document.getElementById("input-livro-atual");
  const autorInput = document.getElementById("input-autor-atual");
  const pagInput = document.getElementById("input-pagina-atual");
  const totInput = document.getElementById("input-total-paginas");
  const previewEl = document.getElementById("preview-progresso-texto");

  tituloInput.value = atual.titulo || "";
  autorInput.value = atual.autor || "";
  pagInput.value = atual.paginaAtual ?? "";
  totInput.value = atual.totalPaginas ?? "";

  const pct = atual.progresso ?? calcularProgressoLeitura(atual.titulo, atual.paginaAtual, atual.totalPaginas);
  if (previewEl) previewEl.textContent = `Progresso calculado: ${pct}%`;
}

function inicializarModalLeitura() {
  const modal = document.getElementById("modal-leitura-atual");
  const btnFechar = document.getElementById("btn-fechar-leitura");
  const btnCancelar = document.getElementById("btn-cancelar-leitura");
  const form = document.getElementById("form-leitura-atual");
  const slotSelect = document.getElementById("slot-leitura-index");
  const tituloInput = document.getElementById("input-livro-atual");
  const pagInput = document.getElementById("input-pagina-atual");
  const totInput = document.getElementById("input-total-paginas");
  const previewEl = document.getElementById("preview-progresso-texto");

  if (!modal || !form) return;

  const atualizarPreview = () => {
    const pct = calcularProgressoLeitura(tituloInput.value, pagInput.value, totInput.value);
    if (previewEl) previewEl.textContent = `Progresso calculado: ${pct}%`;
  };

  if (slotSelect) {
    slotSelect.addEventListener("change", () => {
      preencherCamposModalLeitura(Number(slotSelect.value));
    });
  }

  [tituloInput, pagInput, totInput].forEach(el => {
    if (el) el.addEventListener("input", atualizarPreview);
  });

  const fechar = () => modal.classList.remove("ativo");
  if (btnFechar) btnFechar.addEventListener("click", fechar);
  if (btnCancelar) btnCancelar.addEventListener("click", fechar);
  modal.addEventListener("click", (e) => { if (e.target === modal) fechar(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const slot = Number(slotSelect?.value || 0);
    const titulo = tituloInput.value.trim();
    const autor = document.getElementById("input-autor-atual").value.trim();
    const paginaAtual = Number(pagInput.value) || 0;
    const totalPaginas = Number(totInput.value) || 0;
    const progresso = calcularProgressoLeitura(titulo, paginaAtual, totalPaginas);

    if (!titulo) return;

    const usuario = obterUsuarioLogado() || {};
    const lista = Array.isArray(usuario.leituraAtualLista) ? [...usuario.leituraAtualLista] : [];
    lista[slot] = {
      titulo,
      autor: autor || "Autor desconhecido",
      paginaAtual,
      totalPaginas,
      progresso
    };

    salvarUsuarioLogado({
      leituraAtualLista: lista.slice(0, 2),
      leituraAtual: lista[0]
    });

    fechar();
    carregarLeiturasAtuais();
  });
}

// 2. LIVROS À VENDA
function adicionarAoCarrinhoPerfil(titulo, precoNum, capaUrl, btnEl) {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const existente = carrinho.find(c => c.titulo === titulo);
  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({
      titulo,
      preco: precoNum,
      capa: capaUrl || "",
      quantidade: 1
    });
  }
  localStorage.setItem("carrinho", JSON.stringify(carrinho));

  if (btnEl) {
    const orig = btnEl.textContent;
    btnEl.textContent = "✔ Adicionado";
    setTimeout(() => { btnEl.textContent = orig; }, 1400);
  }
}

async function montarItemLivroVenda(itemVenda) {
  let titulo = itemVenda.titulo;
  let capaUrl = null;

  try {
    const resp = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(itemVenda.titulo)}&limit=1`);
    const dados = await resp.json();
    if (dados.docs && dados.docs.length > 0) {
      const doc = dados.docs[0];
      titulo = doc.title || titulo;
      if (doc.cover_i) {
        capaUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg`;
      }
    }
  } catch (e) {
    console.error("Erro ao buscar capa do livro à venda:", e);
  }

  const precoNum = Number(itemVenda.preco) || PRECOS_PERFIL_FIXOS[itemVenda.titulo] || 39.90;
  const precoFormatado = precoNum.toFixed(2).replace(".", ",");

  const row = document.createElement("div");
  row.className = "livro-item";
  row.innerHTML = `
    <div class="livro-capa">${capaUrl ? `<img src="${capaUrl}" alt="Capa ${titulo}">` : "📘"}</div>
    <div class="livro-info">
      <strong>${titulo}</strong>
      <span class="estrelas">${gerarEstrelas(4)}</span>
    </div>
    <div class="livro-acao-coluna">
      <div class="livro-preco">R$${precoFormatado}</div>
      <button type="button" class="btn-add-carrinho-perfil">+ Carrinho</button>
    </div>
  `;

  const btnAdd = row.querySelector(".btn-add-carrinho-perfil");
  btnAdd.addEventListener("click", () => {
    adicionarAoCarrinhoPerfil(titulo, precoNum, capaUrl || "", btnAdd);
  });

  return row;
}

async function carregarLivrosVenda() {
  const container = document.getElementById("lista-livros-venda");
  const btnVerTodos = document.getElementById("btn-ver-todos-venda");
  if (!container) return;

  const usuario = obterUsuarioLogado();
  const livrosVenda = usuario?.livrosVenda || [];

  if (btnVerTodos) {
    btnVerTodos.style.display = livrosVenda.length > LIMITE_LIVROS_CARD_VENDA ? "block" : "none";
  }

  if (livrosVenda.length === 0) {
    container.innerHTML = "<p>Nenhum livro cadastrado à venda.</p>";
    return;
  }

  const exibidosNoCard = livrosVenda.slice(0, LIMITE_LIVROS_CARD_VENDA);
  container.innerHTML = "<p>Carregando livros...</p>";

  const rows = await Promise.all(exibidosNoCard.map(item => montarItemLivroVenda(item)));
  container.innerHTML = "";
  rows.forEach(r => container.appendChild(r));
}

function inicializarModalTodosVenda() {
  const modal = document.getElementById("modal-todos-livros-venda");
  const btnFecharTopo = document.getElementById("btn-fechar-todos-venda");
  const btnFecharBaixo = document.getElementById("btn-fechar-todos-venda-rodape");
  if (!modal) return;

  const fechar = () => modal.classList.remove("ativo");
  if (btnFecharTopo) btnFecharTopo.addEventListener("click", fechar);
  if (btnFecharBaixo) btnFecharBaixo.addEventListener("click", fechar);
  modal.addEventListener("click", (e) => { if (e.target === modal) fechar(); });
}

async function abrirModalTodosVenda() {
  const modal = document.getElementById("modal-todos-livros-venda");
  const listaEl = document.getElementById("lista-todos-livros-venda");
  if (!modal || !listaEl) return;

  const usuario = obterUsuarioLogado();
  const todos = usuario?.livrosVenda || [];
  listaEl.innerHTML = "<p>Carregando catálogo...</p>";
  modal.classList.add("ativo");

  const rows = await Promise.all(todos.map(item => montarItemLivroVenda(item)));
  listaEl.innerHTML = "";
  rows.forEach(r => listaEl.appendChild(r));
}

function inicializarModalAdicionarLivro() {
  const modal = document.getElementById("modal-adicionar-livro");
  const btnFechar = document.getElementById("btn-fechar-livro");
  const btnCancelar = document.getElementById("btn-cancelar-livro");
  const form = document.getElementById("form-adicionar-livro");

  if (!modal || !form) return;

  const fechar = () => {
    form.reset();
    modal.classList.remove("ativo");
  };

  if (btnFechar) btnFechar.addEventListener("click", fechar);
  if (btnCancelar) btnCancelar.addEventListener("click", fechar);
  modal.addEventListener("click", (e) => { if (e.target === modal) fechar(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = document.getElementById("novo-livro-titulo").value.trim();
    const preco = Number(document.getElementById("novo-livro-preco").value);

    if (!titulo || Number.isNaN(preco) || preco <= 0) return;

    const usuario = obterUsuarioLogado() || {};
    const handle = normalizarHandleUsuario(usuario.usuario);
    const listaAtual = Array.isArray(usuario.livrosVenda) ? [...usuario.livrosVenda] : [];
    listaAtual.unshift({
      titulo,
      preco: Number(preco.toFixed(2)),
      usuario: handle,
      vendedor: handle
    });

    salvarUsuarioLogado({ livrosVenda: listaAtual });
    fechar();
    carregarLivrosVenda();
  });
}

// 3. AVALIAÇÕES NO CARD DO PERFIL
function renderAvaliacoesPerfil() {
  const container = document.querySelector(".lista-avaliacoes");
  if (!container) return;

  const usuario = obterUsuarioLogado();
  const salvas = JSON.parse(localStorage.getItem("avaliacoes")) || [];
  const doUsuario = salvas.filter(av => normalizarHandleUsuario(av.usuario) === normalizarHandleUsuario(usuario?.usuario));
  const exibicao = (doUsuario.length ? doUsuario : AVALIACOES_PERFIL_PADRAO).slice(0, 3);

  container.innerHTML = "";
  exibicao.forEach(av => {
    const div = document.createElement("div");
    div.className = "avaliacao-item";
    div.innerHTML = `
      <div class="avaliacao-topo">
        <strong>${av.titulo}</strong>
        <span class="estrelas">${gerarEstrelas(av.nota)}</span>
      </div>
      <p class="avaliacao-texto">${av.comentario}</p>
    `;
    container.appendChild(div);
  });
}

// 4. MEUS GRUPOS
function obterTodosGruposDoUsuario(usuario) {
  const custom = Array.isArray(usuario?.gruposCustom) ? usuario.gruposCustom : [];
  return [...custom, ...GRUPOS_CATALOGO];
}

function renderGruposPerfil() {
  const container = document.querySelector(".lista-grupos");
  if (!container) return;

  const usuario = obterUsuarioLogado();
  const idsSelecionados = new Set(usuario?.gruposIds || []);
  const todosGrupos = obterTodosGruposDoUsuario(usuario);
  const gruposUsuario = todosGrupos.filter(g => idsSelecionados.has(g.id));

  container.innerHTML = "";
  if (gruposUsuario.length === 0) {
    container.innerHTML = "<p style='font-size:13px;color:#777;'>Você ainda não participa de nenhum grupo.</p>";
    return;
  }

  gruposUsuario.forEach(grupo => {
    const item = document.createElement("div");
    item.className = "grupo-item";
    const linkHtml = grupo.link
      ? `<a href="${grupo.link}" target="_blank" rel="noopener noreferrer" class="link-grupo-discord">Entrar no grupo ↗</a>`
      : `<span class="data-grupo">${grupo.data || "Ativo"}</span>`;

    item.innerHTML = `
      <div>
        <strong>${grupo.nome}</strong>
        <p>👤 ${grupo.membros || 1} membros</p>
      </div>
      ${linkHtml}
    `;
    container.appendChild(item);
  });
}

function inicializarModalGrupos() {
  const modal = document.getElementById("modal-grupos-leitura");
  const btnFechar = document.getElementById("btn-fechar-grupos");
  const btnConcluir = document.getElementById("btn-concluir-grupos");
  const formGrupo = document.getElementById("form-cadastrar-grupo");
  const erroEl = document.getElementById("erro-grupo-form");

  if (!modal) return;

  const fechar = () => {
    if (erroEl) {
      erroEl.style.display = "none";
      erroEl.textContent = "";
    }
    modal.classList.remove("ativo");
    renderGruposPerfil();
  };

  if (btnFechar) btnFechar.addEventListener("click", fechar);
  if (btnConcluir) btnConcluir.addEventListener("click", fechar);
  modal.addEventListener("click", (e) => { if (e.target === modal) fechar(); });

  if (formGrupo) {
    formGrupo.addEventListener("submit", (e) => {
      e.preventDefault();
      const nomeInput = document.getElementById("novo-grupo-nome");
      const linkInput = document.getElementById("novo-grupo-link");

      const nomeGrupo = nomeInput.value.trim();
      const linkGrupo = linkInput.value.trim();

      if (!nomeGrupo || nomeGrupo.length < 3) {
        if (erroEl) {
          erroEl.textContent = "Digite um nome de grupo com pelo menos 3 caracteres.";
          erroEl.style.display = "block";
        }
        return;
      }

      let urlValida = false;
      try {
        const parsed = new URL(linkGrupo);
        urlValida = parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch (_) {
        urlValida = false;
      }

      if (!urlValida) {
        if (erroEl) {
          erroEl.textContent = "Informe um link válido começando com https:// (ex: convite do Discord).";
          erroEl.style.display = "block";
        }
        return;
      }

      if (erroEl) erroEl.style.display = "none";

      const usuario = obterUsuarioLogado() || {};
      const customAtual = Array.isArray(usuario.gruposCustom) ? [...usuario.gruposCustom] : [];
      const idsAtuais = new Set(usuario.gruposIds || []);

      const novoId = `custom-${Date.now()}`;
      const novoGrupo = {
        id: novoId,
        nome: nomeGrupo,
        link: linkGrupo,
        membros: 1,
        data: "Novo"
      };

      customAtual.unshift(novoGrupo);
      idsAtuais.add(novoId);

      salvarUsuarioLogado({
        gruposCustom: customAtual,
        gruposIds: Array.from(idsAtuais)
      });

      formGrupo.reset();
      abrirModalGrupos();
    });
  }
}

function abrirModalGrupos() {
  const modal = document.getElementById("modal-grupos-leitura");
  const listaEl = document.getElementById("lista-grupos-disponiveis");
  if (!modal || !listaEl) return;

  const usuario = obterUsuarioLogado() || {};
  const selecionados = new Set(usuario.gruposIds || []);
  const todosGrupos = obterTodosGruposDoUsuario(usuario);

  listaEl.innerHTML = "";
  todosGrupos.forEach(grupo => {
    const marcado = selecionados.has(grupo.id);
    const linha = document.createElement("label");
    linha.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid #e2e8f0;border-radius:10px;cursor:pointer;font-size:13px;";
    linha.innerHTML = `
      <span>
        <strong>${grupo.nome}</strong>
        <small style="display:block;color:#64748b;">${grupo.link ? grupo.link : `${grupo.membros} membros`}</small>
      </span>
      <input type="checkbox" ${marcado ? "checked" : ""} data-grupo-id="${grupo.id}" />
    `;

    const checkbox = linha.querySelector("input");
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selecionados.add(grupo.id);
      } else {
        selecionados.delete(grupo.id);
      }
      salvarUsuarioLogado({ gruposIds: Array.from(selecionados) });
    });

    listaEl.appendChild(linha);
  });

  modal.classList.add("ativo");
}

// BOTÕES DOS CARDS
function inicializarBotoesCards() {
  const btnVerMaisLeitura = document.getElementById("btn-ver-mais-leitura");
  if (btnVerMaisLeitura) {
    btnVerMaisLeitura.addEventListener("click", () => {
      const slotSelect = document.getElementById("slot-leitura-index");
      if (slotSelect) slotSelect.value = "0";
      preencherCamposModalLeitura(0);
      document.getElementById("modal-leitura-atual").classList.add("ativo");
    });
  }

  const btnAddLivro = document.getElementById("btn-abrir-add-livro");
  if (btnAddLivro) {
    btnAddLivro.addEventListener("click", () => {
      document.getElementById("modal-adicionar-livro").classList.add("ativo");
    });
  }

  const btnVerTodosVenda = document.getElementById("btn-ver-todos-venda");
  if (btnVerTodosVenda) {
    btnVerTodosVenda.addEventListener("click", abrirModalTodosVenda);
  }

  const btnVerTodasAv = document.getElementById("btn-ver-todas-avaliacoes");
  if (btnVerTodasAv) {
    btnVerTodasAv.addEventListener("click", () => {
      window.location.href = "avaliacoes.html";
    });
  }

  const btnExplorarGrupos = document.getElementById("btn-explorar-grupos");
  if (btnExplorarGrupos) {
    btnExplorarGrupos.addEventListener("click", abrirModalGrupos);
  }
}

// 5. FEEDBACKS DO USUÁRIO LOGADO
function carregarMeusFeedbacks() {
  const containerFeedbacks = document.getElementById("lista-feedbacks-usuario");
  if (!containerFeedbacks) return;

  const usuarioLogado = obterUsuarioLogado();
  const historico = JSON.parse(localStorage.getItem("feedbacks")) || [];
  const meusFeedbacks = historico.filter(item => normalizarHandleUsuario(item.usuario) === normalizarHandleUsuario(usuarioLogado?.usuario));

  if (meusFeedbacks.length === 0) {
    containerFeedbacks.innerHTML = "<p>Você ainda não enviou nenhum feedback.</p>";
    return;
  }

  containerFeedbacks.innerHTML = "";

  meusFeedbacks.forEach((item, index) => {
    const numeroFeedback = index + 1;
    const dataFormatada = item.data
      ? new Date(item.data).toLocaleDateString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
        })
      : "";

    const cardFeedback = document.createElement("div");
    cardFeedback.className = "card-feedback-item feedback-card-publico";
    cardFeedback.style.cssText = "background: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px;";

    cardFeedback.innerHTML = `
      <h4 style="margin-top: 0; color: #ff8400;">Feedback ${numeroFeedback}</h4>
      <p><strong>Opinião:</strong> ${item.opiniao || "Não informada"}</p>
      <p><strong>Satisfação:</strong> ${item.satisfacao}/10 ⭐</p>
      <p><strong>Recomendaria:</strong> ${item.recomendaria}</p>
      <p><strong>Interesses:</strong> ${item.interesses && item.interesses.length ? item.interesses.join(", ") : "Nenhum"}</p>
      <p><strong>Comentário:</strong> ${item.comentario || "Sem comentário"}</p>
      ${dataFormatada ? `<span style="font-size: 12px; color: #777;">Enviado em: ${dataFormatada}</span>` : ""}
    `;
    containerFeedbacks.appendChild(cardFeedback);
  });
}

// 6. MODAL EDITAR CADASTRO COMPLETO + VALIDAÇÕES
function aplicarMascaraTelefone(valor) {
  const digitos = String(valor || "").replace(/\D/g, "").slice(0, 11);
  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function usuarioJaExisteEmOutroCadastro(novoHandle, usuarioAtual) {
  const handleAtual = normalizarHandleUsuario(usuarioAtual?.usuario);
  if (novoHandle === handleAtual) return false;
  if (HANDLES_RESERVADOS_SISTEMA.includes(novoHandle)) return true;

  const listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  if (!Array.isArray(listaUsuarios)) return false;

  return listaUsuarios.some(u => {
    const h = normalizarHandleUsuario(u.usuario);
    if (!h) return false;
    if (usuarioAtual?.id && u.id && u.id === usuarioAtual.id) return false;
    if (handleAtual && h === handleAtual) return false;
    return h === novoHandle;
  });
}

function emailJaExisteEmOutroCadastro(novoEmail, usuarioAtual) {
  const emailNorm = String(novoEmail || "").trim().toLowerCase();
  const emailAtual = String(usuarioAtual?.email || "").trim().toLowerCase();
  if (!emailNorm || emailNorm === emailAtual) return false;

  const listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  if (!Array.isArray(listaUsuarios)) return false;

  return listaUsuarios.some(u => {
    const e = String(u.email || "").trim().toLowerCase();
    if (!e) return false;
    if (usuarioAtual?.id && u.id && u.id === usuarioAtual.id) return false;
    return e === emailNorm;
  });
}

function inicializarModalEditarPerfil() {
  const modal = document.getElementById("modal-editar-perfil");
  const btnEditar = document.getElementById("btn-editar-perfil");
  const btnFechar = document.getElementById("btn-fechar-modal");
  const btnCancelar = document.getElementById("btn-cancelar-modal");
  const formEditar = document.getElementById("form-editar-perfil");
  const erroEl = document.getElementById("erro-editar-perfil");

  if (!btnEditar || !modal) return;

  const inputNome = document.getElementById("edit-nome");
  const inputUsuario = document.getElementById("edit-usuario");
  const inputEmail = document.getElementById("edit-email");
  const inputTelefone = document.getElementById("edit-telefone");
  const inputNascimento = document.getElementById("edit-nascimento");
  const inputLocalizacao = document.getElementById("edit-localizacao");
  const inputSenha = document.getElementById("edit-senha");
  const inputConfirmarSenha = document.getElementById("edit-confirmar-senha");
  const inputMembroDesde = document.getElementById("edit-membro-desde");
  const inputInteresses = document.getElementById("edit-interesses");
  const inputBio = document.getElementById("edit-bio");

  const exibirErro = (msg) => {
    if (!erroEl) return;
    erroEl.textContent = msg;
    erroEl.style.display = "block";
  };

  const limparErro = () => {
    if (!erroEl) return;
    erroEl.textContent = "";
    erroEl.style.display = "none";
  };

  const fecharModal = () => {
    limparErro();
    if (inputSenha) inputSenha.value = "";
    if (inputConfirmarSenha) inputConfirmarSenha.value = "";
    modal.classList.remove("ativo");
  };

  inputUsuario?.addEventListener("input", () => {
    inputUsuario.value = inputUsuario.value
      .replace(/^@+/, "")
      .replace(/[^a-zA-Z0-9._]/g, "")
      .toLowerCase()
      .slice(0, REGRAS_CADASTRO_PERFIL.USUARIO_MAX);
  });

  inputTelefone?.addEventListener("input", () => {
    inputTelefone.value = aplicarMascaraTelefone(inputTelefone.value);
  });

  btnEditar.addEventListener("click", () => {
    limparErro();
    const usuarioAtual = obterUsuarioLogado() || {};

    inputNome.value = usuarioAtual.nome || "";
    inputUsuario.value = normalizarHandleUsuario(usuarioAtual.usuario || "");
    if (inputEmail) inputEmail.value = usuarioAtual.email || "";
    if (inputTelefone) inputTelefone.value = aplicarMascaraTelefone(usuarioAtual.telefone || "");
    if (inputNascimento) inputNascimento.value = usuarioAtual.dataNascimento || usuarioAtual.nascimento || "";
    if (inputLocalizacao) inputLocalizacao.value = usuarioAtual.localizacao || "";
    if (inputSenha) inputSenha.value = "";
    if (inputConfirmarSenha) inputConfirmarSenha.value = "";

    if (inputMembroDesde) {
      const baseData = usuarioAtual.dataCadastro || usuarioAtual.membroDesde;
      if (baseData) {
        const d = new Date(String(baseData).length === 10 ? `${baseData}T12:00:00` : baseData);
        inputMembroDesde.value = Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
      } else {
        inputMembroDesde.value = "";
      }
    }

    if (inputInteresses) {
      const lista = Array.isArray(usuarioAtual.interessesPerfil)
        ? usuarioAtual.interessesPerfil.join(", ")
        : (usuarioAtual.interessesPerfil || "");
      inputInteresses.value = lista;
    }

    if (inputBio) inputBio.value = usuarioAtual.bio || "";

    modal.classList.add("ativo");
  });

  btnFechar?.addEventListener("click", fecharModal);
  btnCancelar?.addEventListener("click", fecharModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

  formEditar?.addEventListener("submit", (e) => {
    e.preventDefault();
    limparErro();

    const usuarioAtual = obterUsuarioLogado() || {};
    const novoNome = inputNome.value.trim();
    const novoUsuario = normalizarHandleUsuario(inputUsuario.value);
    const novoEmail = inputEmail ? inputEmail.value.trim().toLowerCase() : (usuarioAtual.email || "");
    const novoTelefone = inputTelefone ? inputTelefone.value.trim() : "";
    const digitosTelefone = novoTelefone.replace(/\D/g, "");
    const novaNascimento = inputNascimento ? inputNascimento.value : "";
    const novaLocalizacao = inputLocalizacao ? inputLocalizacao.value.trim() : "";
    const novaSenha = inputSenha ? inputSenha.value : "";
    const confirmarSenha = inputConfirmarSenha ? inputConfirmarSenha.value : "";
    const novaBio = inputBio ? inputBio.value.trim().slice(0, REGRAS_CADASTRO_PERFIL.BIO_MAX) : "";

    if (novoNome.length < REGRAS_CADASTRO_PERFIL.NOME_MIN || novoNome.length > REGRAS_CADASTRO_PERFIL.NOME_MAX) {
      exibirErro(`O nome deve ter entre ${REGRAS_CADASTRO_PERFIL.NOME_MIN} e ${REGRAS_CADASTRO_PERFIL.NOME_MAX} caracteres.`);
      inputNome.focus();
      return;
    }

    if (novoUsuario.length < REGRAS_CADASTRO_PERFIL.USUARIO_MIN || novoUsuario.length > REGRAS_CADASTRO_PERFIL.USUARIO_MAX) {
      exibirErro(`O nome de usuário deve ter entre ${REGRAS_CADASTRO_PERFIL.USUARIO_MIN} e ${REGRAS_CADASTRO_PERFIL.USUARIO_MAX} caracteres.`);
      inputUsuario.focus();
      return;
    }

    if (!REGRAS_CADASTRO_PERFIL.USUARIO_REGEX.test(novoUsuario)) {
      exibirErro("O nome de usuário só pode conter letras minúsculas, números, ponto (.) ou sublinhado (_).");
      inputUsuario.focus();
      return;
    }

    if (usuarioJaExisteEmOutroCadastro(novoUsuario, usuarioAtual)) {
      exibirErro(`O nome de usuário "@${novoUsuario}" já está em uso por outra conta.`);
      inputUsuario.focus();
      return;
    }

    if (novoEmail && !REGRAS_CADASTRO_PERFIL.EMAIL_REGEX.test(novoEmail)) {
      exibirErro("Informe um endereço de e-mail válido.");
      inputEmail?.focus();
      return;
    }

    if (novoEmail && emailJaExisteEmOutroCadastro(novoEmail, usuarioAtual)) {
      exibirErro("Este e-mail já está cadastrado em outra conta.");
      inputEmail?.focus();
      return;
    }

    if (digitosTelefone.length > 0 && (digitosTelefone.length < 10 || digitosTelefone.length > 11)) {
      exibirErro("Informe um telefone válido com DDD (10 ou 11 dígitos).");
      inputTelefone?.focus();
      return;
    }

    if (novaSenha.length > 0 || confirmarSenha.length > 0) {
      if (novaSenha.length < REGRAS_CADASTRO_PERFIL.SENHA_MIN) {
        exibirErro(`A nova senha deve ter no mínimo ${REGRAS_CADASTRO_PERFIL.SENHA_MIN} caracteres.`);
        inputSenha?.focus();
        return;
      }
      if (novaSenha !== confirmarSenha) {
        exibirErro("A confirmação de senha não confere com a nova senha.");
        inputConfirmarSenha?.focus();
        return;
      }
    }

    const interessesArray = inputInteresses
      ? inputInteresses.value.split(",").map(s => s.trim()).filter(Boolean)
      : (usuarioAtual.interessesPerfil || []);

    const novaDataCadastro = inputMembroDesde && inputMembroDesde.value
      ? `${inputMembroDesde.value}T12:00:00.000Z`
      : usuarioAtual.dataCadastro;

    const atualizado = salvarUsuarioLogado({
      nome: novoNome,
      usuario: novoUsuario,
      email: novoEmail,
      telefone: novoTelefone,
      dataNascimento: novaNascimento,
      localizacao: novaLocalizacao,
      bio: novaBio,
      interessesPerfil: interessesArray,
      ...(novaDataCadastro ? { dataCadastro: novaDataCadastro } : {}),
      ...(novaSenha.length >= REGRAS_CADASTRO_PERFIL.SENHA_MIN ? { senha: novaSenha } : {})
    });

    atualizarCabecalhoPerfil(atualizado);
    fecharModal();
  });
}

// 7. FORMULÁRIO DE FEEDBACK
function inicializarFormularioFeedback() {
  const formFeedback = document.getElementById("form-feedback");
  if (!formFeedback) return;

  const rangeSatisfacao = document.getElementById("nota-satisfacao");
  const valorSatisfacao = document.getElementById("nota-satisfacao-valor");
  const confirmacaoDiv = document.getElementById("feedback-confirmacao");
  const btnNovoFeedback = document.getElementById("btn-novo-feedback");
  const estrelas = document.querySelectorAll("#avaliacao-estrelas span");

  function atualizarEstrelas(nota) {
    estrelas.forEach(estrela => {
      estrela.classList.toggle("ativa", Number(estrela.dataset.valor) <= nota);
    });
  }

  atualizarEstrelas(5);

  estrelas.forEach(estrela => {
    estrela.addEventListener("click", () => {
      const nota = Number(estrela.dataset.valor);
      rangeSatisfacao.value = nota;
      valorSatisfacao.textContent = nota;
      atualizarEstrelas(nota);
    });
  });

  formFeedback.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuarioLogado = obterUsuarioLogado() || {};
    const opiniao = document.getElementById("opiniao").value;
    const satisfacao = rangeSatisfacao.value;
    const recomendaria = document.querySelector('input[name="recomendaria"]:checked')?.value || "não respondido";
    const comentario = document.getElementById("comentario").value.trim();

    const interesses = [];
    document.querySelectorAll('input[name="interesse"]:checked').forEach(el => interesses.push(el.value));

    const dadosFeedback = {
      usuario: usuarioLogado.usuario || "desconhecido",
      opiniao,
      satisfacao,
      recomendaria,
      interesses,
      comentario,
      data: new Date().toISOString()
    };

    const historico = JSON.parse(localStorage.getItem("feedbacks")) || [];
    historico.push(dadosFeedback);
    localStorage.setItem("feedbacks", JSON.stringify(historico));

    document.getElementById("conf-opiniao").textContent = opiniao || "não respondido";
    document.getElementById("conf-satisfacao").textContent = satisfacao;
    document.getElementById("conf-recomendaria").textContent = recomendaria;
    document.getElementById("conf-interesses").textContent = interesses.length ? interesses.join(", ") : "nenhum selecionado";
    document.getElementById("conf-comentario").textContent = comentario || "sem comentário";

    formFeedback.style.display = "none";
    confirmacaoDiv.style.display = "block";

    carregarMeusFeedbacks();
  });

  if (btnNovoFeedback) {
    btnNovoFeedback.addEventListener("click", () => {
      formFeedback.reset();
      rangeSatisfacao.value = 5;
      valorSatisfacao.textContent = "5";
      atualizarEstrelas(5);
      confirmacaoDiv.style.display = "none";
      formFeedback.style.display = "block";
    });
  }
}
