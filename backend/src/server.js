// backend/src/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import horariosRoutes from "./routes/horariosRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js"; // rota de relatórios
import pdfRoutes from "./routes/pdfRoutes.js"; // rota para gerar PDF
import feedbackRoutes from "./routes/feedbackRoutes.js"; // nova rota para feedback
import staffRoutes from "./routes/staffRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../../frontend")));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/auth/staff", staffRoutes);
app.use("/horarios", horariosRoutes);
app.use("/admin", adminRoutes);
app.use("/relatorios", relatorioRoutes);
app.use("/relatorios", pdfRoutes);
app.use("/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/html/novo_home.html"));
});

app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, `../../frontend/html/${page}`);
  res.sendFile(filePath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

export default app;
