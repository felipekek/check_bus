import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Simulação de dados vindos do banco (ficam vazios por enquanto)
let feedbacks = [
  { id: 1, aluno: "", email: "", cpf: "", mensagem: "", resposta: "" },
  { id: 2, aluno: "", email: "", cpf: "", mensagem: "", resposta: "" },
  { id: 3, aluno: "", email: "", cpf: "", mensagem: "", resposta: "" }
];

// Rota GET – lista de feedbacks
app.get("/api/feedbacks", (req, res) => {
  res.json(feedbacks);
});

// Rota PUT – atualizar resposta do admin
app.put("/api/feedbacks/:id", (req, res) => {
  const { id } = req.params;
  const { resposta } = req.body;

  const feedback = feedbacks.find(f => f.id == id);
  if (!feedback) return res.status(404).json({ erro: "Feedback não encontrado" });

  feedback.resposta = resposta;
  res.json({ mensagem: "Resposta atualizada com sucesso", feedback });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
