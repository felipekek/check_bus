// backend/src/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Rotas (todas já atualizadas)
import authRoutes from "./routes/authRoutes.js";
import horariosRoutes from "./routes/horariosRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import staffRoutes from "./routes/staffRoutes.js"; // mantenha se usa no login/consulta de staff

const app = express();

/* ---------- Middlewares base ---------- */
app.use(cors()); // ajuste a origem em produção se necessário
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

/* ---------- Caminhos e arquivos estáticos ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Raiz do frontend e pasta de HTMLs
const FRONTEND_DIR = path.join(__dirname, "../../frontend");
const FRONTEND_HTML_DIR = path.join(FRONTEND_DIR, "html");

// Servir arquivos estáticos (js, css, imagens, assets)
app.use(express.static(FRONTEND_DIR));

/* ---------- APIs ---------- */
app.use("/auth", authRoutes);
app.use("/auth/staff", staffRoutes);     // remova se não usar
app.use("/horarios", horariosRoutes);
app.use("/admin", adminRoutes);
app.use("/relatorios", relatorioRoutes); // lista/DELETE/PDF
app.use("/feedback", feedbackRoutes);

/* ---------- Páginas ---------- */
// Home
app.get("/", (_req, res) => {
  res.sendFile(path.join(FRONTEND_HTML_DIR, "novo_home.html"));
});

// Servir páginas HTML por nome: /arquivo.html
app.get("/:page", (req, res, next) => {
  try {
    const page = req.params.page;
    // só serve páginas .html
    if (!page.endsWith(".html")) return next();

    const filePath = path.join(FRONTEND_HTML_DIR, page);
    res.sendFile(filePath, (err) => {
      if (err) next(); // se não existir, cai no 404
    });
  } catch (e) {
    next(e);
  }
});

/* ---------- 404 ---------- */
app.use((req, res) => {
  // se pediu um .html inexistente, retorna HTML simples
  if (req.path.endsWith(".html")) {
    return res.status(404).send("<h1>404</h1><p>Página não encontrada.</p>");
  }
  // padrão para APIs
  res.status(404).json({ error: "Rota não encontrada." });
});

/* ---------- Handler de erro ---------- */
app.use((err, _req, res, _next) => {
  console.error("Erro no servidor:", err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

/* ---------- Start ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

export default app;
