// backend/src/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import horariosRoutes from "./routes/horariosRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js"; // rota de relatórios

const app = express();

// Configurar __dirname no ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para JSON (req.body)
app.use(express.json());

// Servir arquivos estáticos da pasta frontend (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname, "../../frontend")));

// Rotas do backend
app.use("/auth", authRoutes);
app.use("/horarios", horariosRoutes);
app.use("/admin", adminRoutes);
app.use("/relatorios", relatorioRoutes); // ✅ adicionando a rota de relatórios

// Redireciona "/" para index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/html/novo_home.html"));
});

// Redireciona qualquer outro HTML dentro de frontend/html
app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, `../../frontend/html/${page}`);
  res.sendFile(filePath);
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

export default app;
