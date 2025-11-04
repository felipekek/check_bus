// backend/src/routes/relatorioRoutes.js
import express from "express";
import { listarRelatorios, excluirRelatorio } from "../controllers/relatorioController.js";
import { gerarPDF, gerarPDFFiltrado } from "../controllers/pdfController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// Lista registros (coleção "acessos") juntando com "alunos" (somente admin)
router.get("/", requireAdmin, listarRelatorios);

// Exclui um registro de acesso (somente admin)
router.delete("/:id", requireAdmin, excluirRelatorio);

// Geração de PDF (completo por querystring) (somente admin)
router.get("/pdf", requireAdmin, gerarPDF);

// Geração de PDF a partir da tabela filtrada no front (POST) (somente admin)
router.post("/pdf-filtrado", requireAdmin, gerarPDFFiltrado);

export default router;
