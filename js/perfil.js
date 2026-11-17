document.addEventListener("DOMContentLoaded", () => {
  const logado = localStorage.getItem("logado") === "true";
  if (!logado) {
    window.location.href = "login.html";
    return;
  }

  const cadastro = JSON.parse(localStorage.getItem("cadastro"));

  if (cadastro) {
    document.getElementById("perfil-nome").textContent = cadastro.nome;
    document.getElementById("perfil-email").textContent = "@" + cadastro.usuario;

    // ✅ Gera as iniciais do avatar a partir do nome
    const avatarEl = document.getElementById("perfil-avatar-iniciais");
    if (avatarEl && cadastro.nome) {
      const partesNome = cadastro.nome.trim().split(" ");
      const iniciais = partesNome.length > 1
        ? (partesNome[0][0] + partesNome[partesNome.length - 1][0])
        : partesNome[0].substring(0, 2);
      avatarEl.textContent = iniciais.toUpperCase();
    }

    if (cadastro.dataCadastro) {
      const data = new Date(cadastro.dataCadastro);
      const mesesPtBr = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      const mes = mesesPtBr[data.getMonth()];
      const ano = data.getFullYear();

      document.getElementById("perfil-membro").textContent = `🕐 Membro desde: ${mes} de ${ano}`;
    }
  }

  // Carregar os feedbacks na tela de perfil assim que a página abrir
  carregarMeusFeedbacks();
});

// ✅ Função para carregar e listar os feedbacks do usuário logado (Feedback 1, Feedback 2...)
function carregarMeusFeedbacks() {
  const containerFeedbacks = document.getElementById("lista-feedbacks-usuario");
  if (!containerFeedbacks) return;

  const cadastro = JSON.parse(localStorage.getItem("cadastro"));
  const historico = JSON.parse(localStorage.getItem("feedbacks")) || [];

  // Filtra apenas os feedbacks do usuário logado (pelo username)
  const meusFeedbacks = historico.filter(item => item.usuario === cadastro?.usuario);

  if (meusFeedbacks.length === 0) {
    containerFeedbacks.innerHTML = "<p>Você ainda não enviou nenhum feedback.</p>";
    return;
  }

  containerFeedbacks.innerHTML = "";

  meusFeedbacks.forEach((item, index) => {
    const numeroFeedback = index + 1; // feedback1, feedback2...
    const dataFormatada = new Date(item.data).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    const cardFeedback = document.createElement("div");
    cardFeedback.className = "card-feedback-item";
    cardFeedback.style.cssText = "background: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 8px;";
    
    cardFeedback.innerHTML = `
      <h4 style="margin-top: 0; color: #ff8400;">Feedback ${numeroFeedback}</h4>
      <p><strong>Opinião:</strong> ${item.opiniao || "Não informada"}</p>
      <p><strong>Satisfação:</strong> ${item.satisfacao}/10 ⭐</p>
      <p><strong>Recomendaria:</strong> ${item.recomendaria}</p>
      <p><strong>Interesses:</strong> ${item.interesses.length ? item.interesses.join(", ") : "Nenhum"}</p>
      <p><strong>Comentário:</strong> ${item.comentario || "Sem comentário"}</p>
      <span style="font-size: 12px; color: #777;">Enviado em: ${dataFormatada}</span>
    `;
    containerFeedbacks.appendChild(cardFeedback);
  });
}

// Carregar Obras em Destaque
async function carregarObras() {
  const obras = [{ titulo: "Dune", link: "Dune.html" }];
  const container = document.getElementById("carrosel-livros-pg-perfil");
  if (!container) return;
  container.innerHTML = "";

  for (const obra of obras) {
    try {
      const resposta = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(obra.titulo)}&limit=1`);
      const dados = await resposta.json();

      if (dados.docs.length > 0) {
        const livro = dados.docs[0];
        const titulo = livro.title;
        const autor = livro.author_name ? livro.author_name[0] : "Autor desconhecido";
        const capaId = livro.cover_i;
        const capaUrl = capaId ? `https://covers.openlibrary.org/b/id/${capaId}-M.jpg` : "https://via.placeholder.com/150x210?text=Sem+Capa";

        const card = document.createElement("a");
        card.href = obra.link;
        card.className = "livro-card-perfil";
        card.innerHTML = `
          <div class="livro-capa-perfil">
            <img src="${capaUrl}" alt="Capa ${titulo}">
            <div class="livro-overlay-perfil"></div>
          </div>
          <div class="livro-info-perfil">
            <p class="titulo-perfil">${titulo}</p>
            <p class="autor-perfil">${autor}</p>
            <span><p class="star">★★★★☆</p></span>
          </div>
        `;
        container.appendChild(card);
      }
    } catch (erro) {
      console.error("Erro ao carregar obra:", obra, erro);
    }
  }
}
document.addEventListener("DOMContentLoaded", carregarObras);

// Carregar Livros à Venda
async function carregarLivrosVenda() {
  const container = document.getElementById("lista-livros-venda");
  if (!container) return;
  container.innerHTML = "<p>Carregando livros...</p>";

  const livrosVenda = [
    { titulo: "O Alquimista", preco: (Math.random() * 30 + 15).toFixed(2) },
    { titulo: "Sapiens", preco: (Math.random() * 30 + 15).toFixed(2) },
    { titulo: "Duna", preco: (Math.random() * 30 + 15).toFixed(2) }
  ];

  try {
    const requisicoes = livrosVenda.map(obra =>
      fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(obra.titulo)}&limit=1`).then(res => res.json())
    );

    const resultados = await Promise.all(requisicoes);
    container.innerHTML = "";

    resultados.forEach((dados, index) => {
      if (!dados.docs || dados.docs.length === 0) return;

      const livro = dados.docs[0];
      const titulo = livro.title || "Título desconhecido";
      const capaId = livro.cover_i;
      const capaUrl = capaId ? `https://covers.openlibrary.org/b/id/${capaId}-S.jpg` : null;

      const nota = 4;
      const estrelasHtml = gerarEstrelas(nota);
      const preco = livrosVenda[index].preco;

      const item = document.createElement("div");
      item.className = "livro-item";
      item.innerHTML = `
        <div class="livro-capa">${capaUrl ? `<img src="${capaUrl}" alt="Capa ${titulo}">` : "📘"}</div>
        <div class="livro-info"><strong>${titulo}</strong><span class="estrelas">${estrelasHtml}</span></div>
        <div class="livro-preco">R$${preco}</div>
      `;
      container.appendChild(item);
    });
  } catch (erro) {
    console.error("Erro ao carregar livros:", erro);
    container.innerHTML = "<p>Erro ao carregar livros.</p>";
  }
}

function gerarEstrelas(nota) {
  const notaArredondada = Math.round(nota);
  return "★".repeat(notaArredondada) + "☆".repeat(5 - notaArredondada);
}

document.addEventListener("DOMContentLoaded", carregarLivrosVenda);

// Carregar Livro Atual
async function carregarLivroAtual() {
  const capaEl = document.getElementById("capa-livro-atual");
  const tituloEl = document.getElementById("titulo-livro-atual");
  const autorEl = document.getElementById("autor-livro-atual");
  const progressoValorEl = document.getElementById("progresso-valor");
  const barraEl = document.getElementById("barra-progresso");

  if (!tituloEl) return;

  const livroAtual = { titulo: "Dune", progresso: 68 };

  try {
    const resposta = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(livroAtual.titulo)}&limit=1`);
    const dados = await resposta.json();

    if (dados.docs && dados.docs.length > 0) {
      const livro = dados.docs[0];
      tituloEl.textContent = livro.title || livroAtual.titulo;
      autorEl.textContent = livro.author_name ? livro.author_name[0] : "Autor desconhecido";

      const capaId = livro.cover_i;
      if (capaId && capaEl) {
        capaEl.style.backgroundImage = `url(https://covers.openlibrary.org/b/id/${capaId}-M.jpg)`;
      }
    }
  } catch (erro) {
    console.error("Erro ao carregar livro atual:", erro);
  }

  if (progressoValorEl) progressoValorEl.textContent = `${livroAtual.progresso}%`;
  if (barraEl) barraEl.style.width = `${livroAtual.progresso}%`;
}

document.addEventListener("DOMContentLoaded", carregarLivroAtual);

// Modal de Editar Perfil
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-editar-perfil");
  const btnEditar = document.getElementById("btn-editar-perfil");
  const btnFechar = document.getElementById("btn-fechar-modal");
  const btnCancelar = document.getElementById("btn-cancelar-modal");
  const formEditar = document.getElementById("form-editar-perfil");

  if (!btnEditar || !modal) return;

  const inputNome = document.getElementById("edit-nome");
  const inputUsuario = document.getElementById("edit-usuario");
  const inputTelefone = document.getElementById("edit-telefone");

  btnEditar.addEventListener("click", () => {
    const cadastro = JSON.parse(localStorage.getItem("cadastro"));
    if (cadastro) {
      inputNome.value = cadastro.nome || "";
      inputUsuario.value = cadastro.usuario || "";
      inputTelefone.value = cadastro.telefone || "";
    }
    modal.classList.add("ativo");
  });

  function fecharModal() { modal.classList.remove("ativo"); }
  btnFechar.addEventListener("click", fecharModal);
  btnCancelar.addEventListener("click", fecharModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });

  formEditar.addEventListener("submit", (e) => {
    e.preventDefault();
    const cadastro = JSON.parse(localStorage.getItem("cadastro")) || {};

    cadastro.nome = inputNome.value.trim();
    cadastro.usuario = inputUsuario.value.trim();
    cadastro.telefone = inputTelefone.value.trim();

    localStorage.setItem("cadastro", JSON.stringify(cadastro));

    document.getElementById("perfil-nome").textContent = cadastro.nome;
    document.getElementById("perfil-email").textContent = "@" + cadastro.usuario;

    fecharModal();
  });
});

// ✅ Gestão do Formulário de Feedback e Interação por Estrelas (1 a 10)
document.addEventListener("DOMContentLoaded", () => {
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

    const cadastro = JSON.parse(localStorage.getItem("cadastro")) || {};
    const opiniao = document.getElementById("opiniao").value;
    const satisfacao = rangeSatisfacao.value;
    const recomendaria = document.querySelector('input[name="recomendaria"]:checked')?.value || "não respondido";
    const comentario = document.getElementById("comentario").value.trim();

    const interesses = [];
    document.querySelectorAll('input[name="interesse"]:checked').forEach(el => interesses.push(el.value));

    const dadosFeedback = {
      usuario: cadastro.usuario || "desconhecido",
      opiniao,
      satisfacao,
      recomendaria,
      interesses,
      comentario,
      data: new Date().toISOString()
    };

    // Salva no localStorage em formato de array dinâmico
    const historico = JSON.parse(localStorage.getItem("feedbacks")) || [];
    historico.push(dadosFeedback);
    localStorage.setItem("feedbacks", JSON.stringify(historico));

    // Preenche a tela de confirmação
    document.getElementById("conf-opiniao").textContent = opiniao || "não respondido";
    document.getElementById("conf-satisfacao").textContent = satisfacao;
    document.getElementById("conf-recomendaria").textContent = recomendaria;
    document.getElementById("conf-interesses").textContent = interesses.length ? interesses.join(", ") : "nenhum selecionado";
    document.getElementById("conf-comentario").textContent = comentario || "sem comentário";

    // Oculta o formulário e mostra a confirmação
    formFeedback.style.display = "none";
    confirmacaoDiv.style.display = "block";

    // Atualiza imediatamente a lista de feedbacks embaixo do perfil
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
});