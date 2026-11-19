document.addEventListener("DOMContentLoaded", () => {
    const listaEl = document.getElementById("lista-itens-carrinho");
    const totalEl = document.getElementById("valor-total");
    const selectPagamento = document.getElementById("forma-pagamento");
    const formPagamento = document.getElementById("form-pagamento");
    const erroPagamento = document.getElementById("erro-pagamento");

    function renderizarCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        listaEl.innerHTML = "";
        let total = 0;

        if (carrinho.length === 0) {
            listaEl.innerHTML = "<p>Seu carrinho está vazio.</p>";
            totalEl.textContent = "0,00";
            return;
        }

        carrinho.forEach((item, index) => {
            const subtotal = item.preco * item.quantidade;
            total += subtotal;

            const div = document.createElement("div");
            div.className = "item-carrinho";
            div.innerHTML = `
                <div>
                    <strong>${item.titulo}</strong><br>
                    <small>Qtd: ${item.quantidade} x R$ ${item.preco.toFixed(2)}</small>
                </div>
                <div>
                    <span>R$ ${subtotal.toFixed(2)}</span>
                    <button type="button" onclick="removerItem(${index})" style="margin-left:10px; color:red; border:none; background:none; cursor:pointer;">✕</button>
                </div>
            `;
            listaEl.appendChild(div);
        });

        totalEl.textContent = total.toFixed(2).replace(".", ",");
    }

    window.removerItem = (index) => {
        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho.splice(index, 1);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        renderizarCarrinho();
    };

    // Alterna os campos visuais conforme a forma de pagamento
    selectPagamento.addEventListener("change", (e) => {
        document.querySelectorAll(".metodo-campos").forEach(el => el.classList.remove("ativo"));
        if (e.target.value === "cartao") document.getElementById("campos-cartao").classList.add("ativo");
        if (e.target.value === "pix") document.getElementById("campos-pix").classList.add("ativo");
    });

    // Finaliza a compra e salva em "pedidos"
    formPagamento.addEventListener("submit", (e) => {
        e.preventDefault();
        erroPagamento.style.display = "none";

        const logado = localStorage.getItem("logado") === "true";
        const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        if (!logado || !usuarioLogado) {
            erroPagamento.textContent = "Você precisa estar logado para finalizar a compra.";
            erroPagamento.style.display = "block";
            return;
        }

        if (carrinho.length === 0) {
            erroPagamento.textContent = "Adicione pelo menos um livro ao carrinho.";
            erroPagamento.style.display = "block";
            return;
        }

        const forma = selectPagamento.value;
        if (!forma) {
            erroPagamento.textContent = "Selecione uma forma de pagamento.";
            erroPagamento.style.display = "block";
            return;
        }

        if (forma === "cartao") {
            const num = document.getElementById("num-cartao").value.replace(/\D/g, "");
            const cvv = document.getElementById("cvv-cartao").value.replace(/\D/g, "");
            if (num.length !== 16 || cvv.length !== 3) {
                erroPagamento.textContent = "Preencha corretamente os 16 dígitos do cartão e o CVV.";
                erroPagamento.style.display = "block";
                return;
            }
        }

        // Calcula total
        const valorTotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

        // Cria o registro do pedido vinculado ao usuário
        const novoPedido = {
            numeroPedido: "#" + Math.floor(100000 + Math.random() * 900000),
            usuario: usuarioLogado.usuario,
            itens: carrinho,
            total: valorTotal.toFixed(2),
            pagamento: forma.toUpperCase(),
            status: "Pagamento Aprovado",
            data: new Date().toISOString()
        };

        const todosPedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
        todosPedidos.push(novoPedido);
        localStorage.setItem("pedidos", JSON.stringify(todosPedidos));

        // Limpa o carrinho
        localStorage.removeItem("carrinho");

        // Confirmação visual sem alert
        document.querySelector(".checkout-container").innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <h2 style="color: #28a745;">✅ Pedido ${novoPedido.numeroPedido} realizado com sucesso!</h2>
                <p>Você pode acompanhar seus livros na área <strong>Meus Pedidos</strong> do seu perfil.</p>
                <a href="meus-pedidos.html" style="display:inline-block; margin-top:15px; padding:10px 20px; background:#ff8400; color:#fff; text-decoration:none; border-radius:6px;">Ver Meus Pedidos</a>
            </div>
        `;
    });

    renderizarCarrinho();
});