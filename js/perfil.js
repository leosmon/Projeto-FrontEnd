document.addEventListener("DOMContentLoaded", () => {
  const cadastro = JSON.parse(localStorage.getItem("cadastro"));

  if (cadastro) {
    document.getElementById("perfil-nome").textContent = cadastro.nome;
    document.getElementById("perfil-email").textContent = "@" + cadastro.usuario;

    // btn-login e btn-cadastro são CLASSES no header.html, não IDs
    document.querySelectorAll(".btn-login").forEach(el => el.style.display = "none");
    document.querySelectorAll(".btn-cadastro").forEach(el => el.style.display = "none");

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
});

//ss

async function carregarObras() {
  const obras = [
    { titulo: "Dune", link: "Dune.html" }
  ];

  const container = document.getElementById("carrosel-livros-pg-perfil");
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
        const capaUrl = capaId
          ? `https://covers.openlibrary.org/b/id/${capaId}-M.jpg`
          : "https://via.placeholder.com/150x210?text=Sem+Capa";

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

carregarObras();

async function carregarLivrosVenda() {
  const container = document.getElementById("lista-livros-venda");
  container.innerHTML = "<p>Carregando livros...</p>";

  const livrosVenda = [
    { titulo: "O Alquimista", preco: (Math.random() * 30 + 15).toFixed(2) },
    { titulo: "Sapiens", preco: (Math.random() * 30 + 15).toFixed(2) },
    { titulo: "Duna", preco: (Math.random() * 30 + 15).toFixed(2) }
  ];

  try {
    const requisicoes = livrosVenda.map(obra =>
      fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(obra.titulo)}&limit=1`)
        .then(res => res.json())
    );

    const resultados = await Promise.all(requisicoes);
    container.innerHTML = "";

    resultados.forEach((dados, index) => {
      if (!dados.docs || dados.docs.length === 0) return;

      const livro = dados.docs[0];
      const titulo = livro.title || "Título desconhecido";
      const capaId = livro.cover_i;
      const capaUrl = capaId
        ? `https://covers.openlibrary.org/b/id/${capaId}-S.jpg`
        : null;

      const nota = 4;
      const estrelasHtml = gerarEstrelas(nota);
      const preco = livrosVenda[index].preco;

      const item = document.createElement("div");
      item.className = "livro-item";
      item.innerHTML = `
        <div class="livro-capa">
          ${capaUrl ? `<img src="${capaUrl}" alt="Capa ${titulo}">` : "📘"}
        </div>
        <div class="livro-info">
          <strong>${titulo}</strong>
          <span class="estrelas">${estrelasHtml}</span>
        </div>
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

async function carregarLivroAtual() {
  const capaEl = document.getElementById("capa-livro-atual");
  const tituloEl = document.getElementById("titulo-livro-atual");
  const autorEl = document.getElementById("autor-livro-atual");
  const estrelasEl = document.getElementById("estrelas-livro-atual");
  const progressoValorEl = document.getElementById("progresso-valor");
  const barraEl = document.getElementById("barra-progresso");

  // Esses dados viriam do seu backend/banco (livro que o usuário está lendo + progresso salvo)
  const livroAtual = {
    titulo: "Dune",
    progresso: 68
  };

  try {
    const resposta = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(livroAtual.titulo)}&limit=1`);
    const dados = await resposta.json();

    if (dados.docs && dados.docs.length > 0) {
      const livro = dados.docs[0];

      tituloEl.textContent = livro.title || livroAtual.titulo;
      autorEl.textContent = livro.author_name ? livro.author_name[0] : "Autor desconhecido";

      const capaId = livro.cover_i;
      if (capaId) {
        const capaUrl = `https://covers.openlibrary.org/b/id/${capaId}-M.jpg`;
        capaEl.style.backgroundImage = `url(${capaUrl})`;
      }
    }
  } catch (erro) {
    console.error("Erro ao carregar livro atual:", erro);
  }

  // Progresso e nota vêm do seu sistema (localStorage, banco de dados, etc), não da API
  progressoValorEl.textContent = `${livroAtual.progresso}%`;
  barraEl.style.width = `${livroAtual.progresso}%`;
}

document.addEventListener("DOMContentLoaded", carregarLivroAtual); // ⬅️ chamada que faltava

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-editar-perfil");
  const btnEditar = document.getElementById("btn-editar-perfil");
  const btnFechar = document.getElementById("btn-fechar-modal");
  const btnCancelar = document.getElementById("btn-cancelar-modal");
  const formEditar = document.getElementById("form-editar-perfil");

  const inputNome = document.getElementById("edit-nome");
  const inputUsuario = document.getElementById("edit-usuario");
  const inputTelefone = document.getElementById("edit-telefone");

  // Abre o modal e preenche com os dados atuais
  btnEditar.addEventListener("click", () => {
    const cadastro = JSON.parse(localStorage.getItem("cadastro"));
    if (cadastro) {
      inputNome.value = cadastro.nome || "";
      inputUsuario.value = cadastro.usuario || "";
      inputTelefone.value = cadastro.telefone || "";
    }
    modal.classList.add("ativo");
  });

  // Fecha o modal
  function fecharModal() {
    modal.classList.remove("ativo");
  }

  btnFechar.addEventListener("click", fecharModal);
  btnCancelar.addEventListener("click", fecharModal);

  // Fecha clicando fora do card do modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  // Salva as alterações
  formEditar.addEventListener("submit", (e) => {
    e.preventDefault();

    const cadastro = JSON.parse(localStorage.getItem("cadastro")) || {};

    cadastro.nome = inputNome.value.trim();
    cadastro.usuario = inputUsuario.value.trim();
    cadastro.telefone = inputTelefone.value.trim();

    localStorage.setItem("cadastro", JSON.stringify(cadastro));

    // Atualiza a tela sem precisar recarregar a página
    document.getElementById("perfil-nome").textContent = cadastro.nome;
    document.getElementById("perfil-email").textContent = "@" + cadastro.usuario;

    fecharModal();
  });
});