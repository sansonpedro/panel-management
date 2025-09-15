const apiBase = "http://localhost:3000";
const produtosBody = document.getElementById("produtosBody");
const newProductForm = document.getElementById("newProductForm");
const modalHistorico = document.getElementById("modalHistorico");
const historicoList = document.getElementById("historicoList");
const closeModal = document.getElementById("closeModal");

function montaLinhaProduto(produto) {
  const tr = document.createElement("tr");

  const tdId = document.createElement("td");
  tdId.textContent = produto.id;
  tr.appendChild(tdId);

  const tdNome = document.createElement("td");
  tdNome.textContent = produto.nome;
  tr.appendChild(tdNome);

  const tdQuantidade = document.createElement("td");
  tdQuantidade.textContent = produto.quantidade;
  if (produto.quantidade < 10) {
    tdQuantidade.classList.add("estoque-baixo");
  }
  tr.appendChild(tdQuantidade);

  const tdAcoes = document.createElement("td");
  tdAcoes.className = "actions";

  const inputQtd = document.createElement("input");
  inputQtd.type = "number";
  inputQtd.min = 1;
  inputQtd.value = 1;

  const btnEntrada = document.createElement("button");
  btnEntrada.className = "btn btn-entrada";
  btnEntrada.textContent = "Registrar Entrada";
  btnEntrada.addEventListener("click", () => handleEntrada(produto.id, inputQtd.value, tdQuantidade));

  const btnSaida = document.createElement("button");
  btnSaida.className = "btn btn-saida";
  btnSaida.textContent = "Registrar Saída";
  btnSaida.addEventListener("click", () => handleSaida(produto.id, inputQtd.value, tdQuantidade));

  const btnHistorico = document.createElement("button");
  btnHistorico.className = "btn btn-historico";
  btnHistorico.textContent = "Ver Histórico";
  btnHistorico.addEventListener("click", () => exibirHistorico(produto.id));

  tdAcoes.appendChild(inputQtd);
  tdAcoes.appendChild(btnEntrada);
  tdAcoes.appendChild(btnSaida);
  tdAcoes.appendChild(btnHistorico);

  tr.appendChild(tdAcoes);
  return tr;
}

function atualizarTabela(produtos) {
  produtosBody.innerHTML = "";
  for (let i = 0; i < produtos.length; i++) {
    const linha = montaLinhaProduto(produtos[i]);
    produtosBody.appendChild(linha);
  }
}

function fetchProdutos() {
  fetch(`${apiBase}/produtos`)
    .then(resp => resp.json())
    .then(data => atualizarTabela(data))
    .catch(err => alert("Erro ao buscar produtos: " + err.message));
}

function handleEntrada(id, quantidade, tdQuantidade) {
  const qtd = Number(quantidade);
  if (!Number.isFinite(qtd) || qtd <= 0) {
    alert("Quantidade inválida");
    return;
  }
  fetch(`${apiBase}/produtos/${id}/entrada`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantidade: qtd })
  })
    .then(resp => {
      if (!resp.ok) throw new Error("Erro ao registrar entrada");
      return resp.json();
    })
    .then(prodAtualizado => {
      tdQuantidade.textContent = prodAtualizado.quantidade;
      if (prodAtualizado.quantidade < 10) tdQuantidade.classList.add("estoque-baixo");
      else tdQuantidade.classList.remove("estoque-baixo");
    })
    .catch(err => alert(err.message));
}

function handleSaida(id, quantidade, tdQuantidade) {
  const qtd = Number(quantidade);
  if (!Number.isFinite(qtd) || qtd <= 0) {
    alert("Quantidade inválida");
    return;
  }
  fetch(`${apiBase}/produtos/${id}/saida`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantidade: qtd })
  })
    .then(resp => {
      if (!resp.ok) return resp.json().then(j => { throw new Error(j.mensagem || "Erro na saída") });
      return resp.json();
    })
    .then(prodAtualizado => {
      tdQuantidade.textContent = prodAtualizado.quantidade;
      if (prodAtualizado.quantidade < 10) tdQuantidade.classList.add("estoque-baixo");
      else tdQuantidade.classList.remove("estoque-baixo");
    })
    .catch(err => alert(err.message));
}

function exibirHistorico(id) {
  historicoList.innerHTML = "Carregando...";
  modalHistorico.classList.remove("hidden");
  fetch(`${apiBase}/produtos/${id}/historico`)
    .then(resp => {
      if (!resp.ok) throw new Error("Erro ao buscar histórico");
      return resp.json();
    })
    .then(data => {
      historicoList.innerHTML = "";
      if (!data || data.length === 0) {
        historicoList.innerHTML = "<li>Nenhum registro</li>";
        return;
      }
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const li = document.createElement("li");
        li.textContent = `${new Date(item.data).toLocaleString()} — ${item.tipo.toUpperCase()} — qtd: ${item.quantidade}`;
        historicoList.appendChild(li);
      }
    })
    .catch(err => {
      historicoList.innerHTML = `<li>Erro: ${err.message}</li>`;
    });
}

closeModal.addEventListener("click", () => modalHistorico.classList.add("hidden"));
modalHistorico.addEventListener("click", (e) => {
  if (e.target === modalHistorico) modalHistorico.classList.add("hidden");
});

// Form para adicionar produto novo
newProductForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = Number(document.getElementById("newId").value);
  const nome = document.getElementById("newNome").value.trim();
  const quantidade = Number(document.getElementById("newQuantidade").value);

  if (!Number.isFinite(id) || !nome || !Number.isFinite(quantidade)) {
    alert("Preencha corretamente os campos");
    return;
  }

  fetch(`${apiBase}/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, nome, quantidade })
  })
    .then(resp => {
      if (!resp.ok) return resp.json().then(j => { throw new Error(j.mensagem || "Erro ao adicionar") });
      return resp.json();
    })
    .then(novoProd => {
      fetchProdutos();
      newProductForm.reset();
    })
    .catch(err => alert(err.message));
});

// Carrega produtos ao abrir a página
fetchProdutos();
