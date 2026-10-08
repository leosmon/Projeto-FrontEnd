# 📚 Search Book

MVP de um portal que conecta leitores — muito além de um catálogo de livros, a proposta é funcionar quase como uma **rede social voltada para leitura**: um ambiente onde os usuários podem avaliar livros, comprar/vender/trocar obras, descobrir novos autores e universos literários, e participar de comunidades/grupos de leitura.

Projeto desenvolvido para a disciplina **Projeto de Desenvolvimento em Front-End** (Curso de Análise e Desenvolvimento de Sistemas), sob orientação do professor Bruno Cezario.

---

## 🔗 Acesso

- **Site no ar:**  https://leosmon.github.io/Projeto-FrontEnd/
- **Protótipo Figma:** https://www.figma.com/make/Z4QyK5Ppb4B00v2Iwvkvj7/SearchBook-interface-design?code-node-id=0-6&p=f&fullscreen=1
- **Repositório:** https://github.com/leosmon/Projeto-FrontEnd/

---

## ✨ Funcionalidades

### Fluxo público
- Landing page com busca de livros, carrosséis dinâmicos (Mais Lidos, Livros que Você Também Precisa Ler, Universos Literários, Autores) e menu de categorias
- Cadastro de usuário com validações client-side (nome, CPF com dígito verificador, CEP via ViaCEP, máscara de telefone, login e senha)
- Login com verificação contra os dados salvos no `localStorage`
- Página de erro personalizada (404 / falha de autenticação)
- Página de avaliações de livros, aberta à comunidade
- Página de sebos e livreiros parceiros
- Detalhe de cada livro, com sinopse traduzida automaticamente (via API de tradução), buscado em tempo real na Open Library

### Fluxo restrito (usuário logado)
- Dashboard/Perfil com avatar (iniciais geradas a partir do nome), dados da conta, "lendo no momento", livros à venda, avaliações e grupos
- Edição de perfil via modal (sem `window.alert`)
- Formulário de feedback com `range`, `select`, `radio` e `checkbox`
- Tela de confirmação exibindo os dados enviados no feedback
- Logout

### Acessibilidade
- Alternância de tema claro/escuro, com preferência salva no `localStorage`
- Botões de aumentar/diminuir o tamanho da fonte (A+ / A-)

---

## 🛠️ Tecnologias

- **HTML5** semântico
- **CSS3** (sem framework de estilos — layout próprio, responsivo em Mobile/Tablet/Desktop)
- **Bootstrap 5.3** — componente de navbar responsiva do header
- **JavaScript (Vanilla)** — toda a lógica de validação, manipulação de DOM, carrosséis e consumo de API
- **[Open Library API](https://openlibrary.org/developers/api)** — catálogo de livros, capas, autores e sinopses
- **[ViaCEP](https://viacep.com.br/)** — preenchimento automático de endereço
- **[MyMemory Translation API](https://mymemory.translated.net/)** — tradução automática de sinopses
- **localStorage** — simulação de persistência de dados (cadastro, sessão, avaliações, feedback), já que este é um projeto exclusivamente front-end

---

## 📁 Estrutura de pastas

```
/
├── index.html                  # Landing page
├── cadastro.html                # Cadastro de usuário
├── login.html                   # Login
├── perfil.html                  # Dashboard / perfil do usuário (restrito)
├── feedback.html                # Formulário de feedback (restrito)
├── confirmacao.html             # Confirmação dos dados enviados (restrito)
├── avaliacoes.html              # Avaliações de livros (comunidade)
├── livro.html                   # Detalhe de um livro específico
├── categoria.html                # Listagem de livros por categoria
├── sebos.html                    # Sebos e livreiros parceiros
├── erro.html                     # Página de erro 404 / falha de autenticação
│
├── /Style                        # Todos os arquivos CSS
│   ├── Style.css                 # Estilos globais (header, carrosséis, footer, dark mode…)
│   ├── perfil.css
│   ├── cadastro.css
│   ├── Login.css
│   ├── avaliacoes.css
│   ├── livro.css
│   └── erro.css
│
├── /js                           # Todos os arquivos JavaScript
│   ├── header-footer.js          # Injeta header/footer, tema, acessibilidade, avatar/logout
│   ├── carrossel.js               # Controlador genérico de carrossel + busca na Open Library
│   ├── cadastro.js                # Validações do cadastro (CPF, nome, senha…) + ViaCEP
│   ├── login.js                   # Autenticação
│   ├── perfil.js                  # Dashboard, livro atual, livros à venda
│   ├── avaliacoes.js              # Avaliações por livro + formulário de nova avaliação
│   ├── feedback.js                # Formulário de feedback
│   ├── confirmacao.js             # Tela de confirmação do feedback
│   └── livro-detalhe.js           # Detalhe do livro + tradução da sinopse
│
├── /complementos                 # Fragmentos HTML reutilizáveis
│   ├── header.html
│   └── footer.html
│
└── /conteudo                     # Imagens e ícones
```

---

## 🚀 Como rodar localmente

Este é um projeto 100% front-end — não precisa de backend, banco de dados nem `npm install`.

1. Clone o repositório:
   ```bash
   git clone [url-do-repositorio]
   ```
2. Como o header e o footer são carregados dinamicamente via `fetch()`, abrir o `index.html` direto pelo navegador (`file://`) vai bloquear essas requisições por CORS. É necessário servir os arquivos por um servidor local, por exemplo:
   - **VS Code:** extensão *Live Server* → botão direito em `index.html` → "Open with Live Server"
   - **Python:** `python3 -m http.server 8000` na pasta do projeto, depois acessar `http://localhost:8000`
3. Pronto — navegue a partir do `index.html`.

---

## 🔑 Simulação de dados (localStorage)

Como não há backend nesta fase, os dados são simulados no navegador:

| Chave | Conteúdo |
|---|---|
| `cadastro` | Objeto JSON com os dados do usuário cadastrado |
| `logado` | `"true"` enquanto a sessão estiver ativa (removido no logout) |
| `tema` | `"dark"` ou `"light"`, preferência de tema |
| `avaliacoes` | Array com as avaliações de livros feitas pelos usuários |
| `feedbacks` | Histórico de todos os feedbacks enviados |
| `ultimoFeedback` | O feedback mais recente, lido pela tela de confirmação |

Para testar o fluxo do zero, limpe o armazenamento pelo Console do navegador (F12):
```javascript
localStorage.clear();
```

---

## 🔭 Próximos passos (fora do escopo desta entrega)

- Chat/mensagens diretas entre leitores
- Sistema de "seguir" outros usuários
- Comentários em avaliações
- Criação de grupos de leitura pelo próprio usuário (hoje são fixos)
- Backend real com banco de dados, substituindo o `localStorage`

---

## 👤 Autor

[Seu Nome Completo] — Curso de Análise e Desenvolvimento de Sistemas, Centro Universitário Augusto Motta (UNISUAM)
