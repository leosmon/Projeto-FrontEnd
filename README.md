📚 Search Book

MVP de um portal que conecta leitores — muito além de um catálogo de livros, a proposta é funcionar quase como uma rede social voltada para leitura: um ambiente onde os usuários podem avaliar livros, comprar/vender/trocar obras, descobrir novos autores e universos literários, e participar de comunidades/grupos de leitura.

Projeto desenvolvido para a disciplina Projeto de Desenvolvimento em Front-End (Curso de Análise e Desenvolvimento de Sistemas), sob orientação do professor Bruno Cezario.

🔗 Acesso
Site no ar: https://leosmon.github.io/Projeto-FrontEnd/
Protótipo Figma: https://www.figma.com/make/Z4QyK5Ppb4B00v2Iwvkvj7/SearchBook-interface-design?code-node-id=0-6&p=f&fullscreen=1
Repositório: https://github.com/leosmon/Projeto-FrontEnd/
👥 Equipe
Leonardo Monteiro
Marcelle
Luiz
Renato

Curso de Análise e Desenvolvimento de Sistemas — Centro Universitário Augusto Motta (UNISUAM)

✨ Funcionalidades
Fluxo público
Landing page com banner, barra de busca (Venda · Troca · Leitura), carrosséis dinâmicos com rolagem infinita (Mais Lidos, Livros que Você Também Precisa Ler, Universos Literários e Autores) e chamada para cadastro
Busca de livros e autores — a barra da página inicial leva a uma página de resultados em formato de loja, com capa, título, autor, ano e número de edições:
aceita título, autor ou gênero (ex.: "fantasia"), com ordenação (relevância, mais recentes, A–Z, menor preço) e "Mostrar mais"
autores encontrados aparecem em cards; ao clicar, abre as obras daquele autor
com poucos resultados, sugere livros semelhantes do mesmo assunto
quando não encontra nada, tenta palavras parecidas (ex.: "harry poter") e, em último caso, sugere livros e autores populares
o tipo escolhido (Venda, Troca ou Leitura) muda o que aparece no card; o campo de cidade/estado leva aos sebos da região
Menu de categorias com 12 gêneros; cada categoria abre a listagem do gênero
Cadastro de usuário com validações client-side (nome, CPF com dígito verificador, CEP via ViaCEP, máscara de telefone, login e senha)
Login com verificação contra os dados salvos no localStorage
Página de erro personalizada (404 / falha de autenticação)
Avaliações de livros, abertas à comunidade: grade de livros com nota média; ao clicar, abre as avaliações e a sinopse; o usuário logado publica a sua (estrelas + comentário)
Sebos e livreiros: lista com busca por nome ou cidade, filtro por estado (com contagem), "Mostrar mais" e layout em cards no celular
Detalhe de cada livro, com sinopse traduzida automaticamente (via API de tradução), buscado em tempo real na Open Library
Fluxo restrito (usuário logado)
Dashboard/Perfil com avatar (iniciais geradas a partir do nome), dados da conta, "lendo no momento", livros à venda, avaliações e grupos
Edição de perfil via modal (sem window.alert)
Formulário de feedback com range, select, radio e checkbox
Tela de confirmação exibindo os dados enviados no feedback
Logout pelo menu do avatar; as telas restritas redirecionam para o login quando não há sessão
Interface e responsividade
Header responsivo (navbar do Bootstrap) com menu de categorias, botões de Login/Cadastrar e, quando logado, avatar com menu (Meu Perfil · Sair)
Rodapé completo: apresentação do projeto, links institucionais, categorias, contato e mapa (OpenStreetMap)
Layout adaptado para Mobile, Tablet e Desktop
Acessibilidade
Alternância de tema claro/escuro, com preferência salva no localStorage
Botões de aumentar/diminuir o tamanho da fonte (A+ / A-), em um painel flutuante recolhível
📋 Telas exigidas no enunciado
Item	Tela	Arquivo
A.1	Landing Page	index.html
A.2	Cadastro de Usuário	cadastro.html
A.3	Login	login.html
A.4	Página de Erro (404 / Auth)	erro.html
B.1	Dashboard / Perfil (nome do usuário e logout no topo)	perfil.html
B.2	Formulário de Feedback / Interesse	feedback.html
B.3	Visualização de Dados (confirmação)	confirmacao.html

As demais páginas (avaliações, busca, detalhe do livro, sebos e livreiros) são extras além do que o enunciado pede.

🛠️ Tecnologias
HTML5 semântico
CSS3 (layout próprio com Flexbox e Grid, responsivo em Mobile/Tablet/Desktop)
Bootstrap 5.3 — navbar responsiva do header e carrossel do banner
JavaScript (Vanilla) — toda a lógica de validação, manipulação de DOM, carrosséis, busca e consumo de API
Open Library API — catálogo de livros, capas, autores e sinopses
ViaCEP — preenchimento automático de endereço
MyMemory Translation API — tradução automática de sinopses
OpenStreetMap — mapa do rodapé
localStorage — simulação de persistência de dados (cadastro, sessão, avaliações, feedback), já que este é um projeto exclusivamente front-end
📁 Estrutura de pastas
/
├── index.html                  # Landing page
├── cadastro.html               # Cadastro de usuário
├── login.html                  # Login
├── perfil.html                 # Dashboard / perfil do usuário (restrito)
├── feedback.html               # Formulário de feedback (restrito)
├── confirmacao.html            # Confirmação dos dados enviados (restrito)
├── avaliacoes.html             # Avaliações de livros (comunidade)
├── busca.html                  # Resultados da busca (livros, autores, gêneros)
├── categoria.html              # Redireciona as categorias do menu para a busca por gênero
├── livro.html                  # Detalhe de um livro específico
├── SebosELivreiros.html        # Sebos e livreiros (busca + filtro por estado)
├── erro.html                   # Página de erro 404 / falha de autenticação
│
├── iniciar-servidor.bat        # Abre o site em um servidor local (Windows)
├── servidor.py                 # Servidor local em Python (qualquer sistema)
├── pre-projeto-searchbook.pdf  # Pré-Projeto: wireframes, fluxograma, paleta e tipografia
├── fluxograma-simples-searchbook.pdf  # Fluxograma das telas exigidas no enunciado
│
├── /Style                      # Todos os arquivos CSS
│   ├── Style2.css              # Estilos globais (header, carrosséis, footer, dark mode…)
│   ├── perfil.css
│   ├── cadastro.css
│   ├── Login.css
│   ├── avaliacoes.css
│   ├── livro.css
│   ├── busca.css
│   ├── sebos.css
│   └── erro.css
│
├── /js                         # Todos os arquivos JavaScript
│   ├── header-footer.js        # Injeta header/footer, tema, acessibilidade, avatar/logout
│   ├── carrossel.js            # Carrossel genérico com rolagem infinita + livros da Open Library
│   ├── pesquisa.js             # Barra de pesquisa da home → busca.html
│   ├── busca.js                # Página de resultados: livros, autores, gêneros e sugestões
│   ├── cadastro.js             # Validações do cadastro (CPF, nome, senha…) + ViaCEP
│   ├── imask.js                # Máscaras dos campos do cadastro
│   ├── login.js                # Autenticação
│   ├── perfil.js               # Dashboard, livro atual, livros à venda, edição de perfil
│   ├── avaliacoes.js           # Avaliações por livro + formulário de nova avaliação
│   ├── feedback.js             # Formulário de feedback
│   ├── confirmacao.js          # Tela de confirmação do feedback
│   ├── livro-detalhe.js        # Detalhe do livro + tradução da sinopse
│   └── sebos.js                # Lista de sebos, busca, filtro por estado e paginação
│
├── /complementos               # Fragmentos HTML reutilizáveis
│   ├── header.html
│   └── footer.html
│
└── /conteudo                   # Imagens e ícones
🚀 Como rodar localmente

Este é um projeto 100% front-end — não precisa de backend, banco de dados nem npm install.

Clone o repositório:
bash
git clone https://github.com/leosmon/Projeto-FrontEnd.git
Como o header e o footer são carregados dinamicamente via fetch(), abrir o index.html direto pelo navegador (file://) bloqueia essas requisições e a página fica sem menu. É necessário servir os arquivos por um servidor local. A forma mais simples:
Windows: dê dois cliques em iniciar-servidor.bat. O navegador abre sozinho em http://localhost:8000/index.html (se a porta 8000 estiver ocupada, ele usa a próxima livre e avisa)
Qualquer sistema: python servidor.py (ou python3 servidor.py) na pasta do projeto
VS Code: extensão Live Server → botão direito em index.html → "Open with Live Server"
Pronto — navegue a partir do index.html.

O servidor precisa de Python 3 instalado (se não houver, o .bat tenta usar o Node.js). Ele aceita acessos apenas do próprio computador e não guarda cache: editou um arquivo, é só atualizar a página.

🔑 Simulação de dados (localStorage)

Como não há backend nesta fase, os dados são simulados no navegador:

Chave	Conteúdo
cadastro	Objeto JSON com os dados do usuário cadastrado
logado	"true" enquanto a sessão estiver ativa (removido no logout)
tema	"dark" ou "light", preferência de tema
avaliacoes	Array com as avaliações de livros feitas pelos usuários
feedbacks	Histórico de todos os feedbacks enviados
ultimoFeedback	O feedback mais recente, lido pela tela de confirmação

O localStorage é separado por endereço: um cadastro feito em localhost:8000 não aparece no site publicado, nem em outra porta.

Para testar o fluxo do zero, limpe o armazenamento pelo Console do navegador (F12):

javascript
localStorage.clear();
📄 Documentação do projeto
Pré-Projeto (PDF) — wireframes, fluxograma, paleta de cores e tipografia
Fluxograma das telas exigidas (PDF)
Protótipo no Figma
🔭 Próximos passos (fora do escopo desta entrega)
Chat/mensagens diretas entre leitores
Sistema de "seguir" outros usuários
Comentários em avaliações
Criação de grupos de leitura pelo próprio usuário (hoje são fixos)
Backend real com banco de dados, substituindo o localStorage (e senhas com hash, que hoje ficam em texto puro apenas porque os dados são simulados)
