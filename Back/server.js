const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Modelo de dados em memória
const produtos = [
  {
    id: 1,
    nome: "Parafuso M4",
    quantidade: 120,
    historico: [
      { tipo: "inicial", quantidade: 120, data: new Date().toISOString() }
    ]
  },
  {
    id: 2,
    nome: "Porca M4",
    quantidade: 45,
    historico: [
      { tipo: "inicial", quantidade: 45, data: new Date().toISOString() }
    ]
  },
  {
    id: 3,
    nome: "Arruela 10mm",
    quantidade: 8,
    historico: [
      { tipo: "inicial", quantidade: 8, data: new Date().toISOString() }
    ]
  },
  {
    id: 4,
    nome: "Parafuso M6",
    quantidade: 200,
    historico: [
      { tipo: "inicial", quantidade: 200, data: new Date().toISOString() }
    ]
  }
];

// Auxiliar: encontra produto por id
function findProdutoIndexById(id) {
  let idx = -1;
  for (let i = 0; i < produtos.length; i++) {
    if (produtos[i].id === id) {
      idx = i;
      break;
    }
  }
  idx;
  return idx;
}

// Listar todos os produtos
app.get("/produtos", (req, res) => {
  res.json(produtos);
});

// Adicionar novo produto
app.post("/produtos", (req, res) => {
  const { id, nome, quantidade } = req.body;
  if (!id || !nome || quantidade == null) {
    res.status(400).json({ mensagem: "id, nome e quantidade são obrigatórios" });
    return;
  }
  const existing = produtos.find(p => p.id === id);
  if (existing) {
    res.status(400).json({ mensagem: "Produto com esse ID já existe" });
    return;
  }
  const novoProduto = {
    id,
    nome,
    quantidade: Number(quantidade),
    historico: [{ tipo: "inicial", quantidade: Number(quantidade), data: new Date().toISOString() }]
  };
  produtos.push(novoProduto);
  res.status(201).json(novoProduto);
});

// Registrar entrada de estoque
app.post("/produtos/:id/entrada", (req, res) => {
  const id = Number(req.params.id);
  const quantidade = Number(req.body.quantidade);
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    res.status(400).json({ mensagem: "quantidade deve ser um número positivo" });
    return;
  }
  const idx = produtos.findIndex(p => p.id === id);
  if (idx === -1) {
    res.status(404).json({ mensagem: "Produto não encontrado" });
    return;
  }
  produtos[idx].quantidade = produtos[idx].quantidade + quantidade;
  produtos[idx].historico.push({ tipo: "entrada", quantidade, data: new Date().toISOString() });
  res.json(produtos[idx]);
});

// Registrar saída de estoque
app.post("/produtos/:id/saida", (req, res) => {
  const id = Number(req.params.id);
  const quantidade = Number(req.body.quantidade);
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    res.status(400).json({ mensagem: "quantidade deve ser um número positivo" });
    return;
  }
  const idx = produtos.findIndex(p => p.id === id);
  if (idx === -1) {
    res.status(404).json({ mensagem: "Produto não encontrado" });
    return;
  }
  if (produtos[idx].quantidade - quantidade < 0) {
    res.status(400).json({ mensagem: "Estoque insuficiente" });
    return;
  }
  produtos[idx].quantidade = produtos[idx].quantidade - quantidade;
  produtos[idx].historico.push({ tipo: "saida", quantidade, data: new Date().toISOString() });
  res.json(produtos[idx]);
});

// Histórico de um produto
app.get("/produtos/:id/historico", (req, res) => {
  const id = Number(req.params.id);
  const produto = produtos.find(p => p.id === id);
  if (!produto) {
    res.status(404).json({ mensagem: "Produto não encontrado" });
    return;
  }
  res.json(produto.historico);
});

app.listen(port, () => {
  console.log(`API de estoque rodando em http://localhost:${port}`);
});

const path = require("path");
app.use(express.static(path.join(__dirname, "../Front")));
