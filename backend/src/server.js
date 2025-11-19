// backend/src/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

/* ---------- Rotas do sistema ---------- */
import authRoutes from "./routes/authRoutes.js";
import horariosRoutes from "./routes/horariosRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import motoristaRoutes from "./routes/motoristaRoutes.js";
import onibusRoutes from "./routes/OnibusRoutes.js"; // ✅ Nova rota de ônibus

/* ---------- Inicialização do app ---------- */
const app = express();

/* ---------- Middlewares base ---------- */
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));


/* ---------- Caminhos e arquivos estáticos ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório base do frontend
const FRONTEND_DIR = path.join(__dirname, "../../frontend");
const FRONTEND_HTML_DIR = path.join(FRONTEND_DIR, "html");

// Servir arquivos estáticos (imagens, CSS, JS)
app.use(express.static(FRONTEND_DIR));

/* ============================================================
 *                      ROTAS DE API
 * ============================================================ */
app.use("/auth", authRoutes);
app.use("/auth/staff", staffRoutes);
app.use("/horarios", horariosRoutes);
app.use("/admin", adminRoutes);
app.use("/relatorios", relatorioRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/motoristas", motoristaRoutes);
app.use("/onibus", onibusRoutes); // ✅ Cadastro e gerenciamento de ônibus

/* ============================================================
 *                      ROTAS DE PÁGINAS
 * ============================================================ */
app.get("/", (_req, res) => {
  res.sendFile(path.join(FRONTEND_HTML_DIR, "novo_home.html"));
});

// Servir páginas HTML diretamente (ex: /cadastro_onibus.html)
app.get("/:page", (req, res, next) => {
  try {
    const { page } = req.params;

    if (!page.endsWith(".html")) return next();

    const filePath = path.join(FRONTEND_HTML_DIR, page);
    res.sendFile(filePath, (err) => {
      if (err) next();
    });
  } catch (e) {
    next(e);
  }
});

/* ============================================================
 *                      TRATAMENTO DE ERROS
 * ============================================================ */

// Página não encontrada (404)
app.use((req, res) => {
  if (req.path.endsWith(".html")) {
    return res
      .status(404)
      .send("<h1>404</h1><p>Página não encontrada.</p>");
  }
  res.status(404).json({ error: "Rota não encontrada." });
});

// Erro interno do servidor
app.use((err, _req, res, _next) => {
  console.error("❌ Erro no servidor:", err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

/* ============================================================
 *                      INICIALIZAÇÃO
 * ============================================================ */
const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor CheckBus rodando em http://localhost:${PORT}`);
  });
}

export default app;
