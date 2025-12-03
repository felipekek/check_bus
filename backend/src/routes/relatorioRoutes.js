// backend/src/routes/relatorioRoutes.js
import express from "express";
import { listarRelatorios, excluirRelatorio } from "../controllers/relatorioController.js";
import { gerarPDF, gerarPDFFiltrado } from "../controllers/pdfController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// Listar registros
router.get("/", requireAdmin, listarRelatorios);

// Excluir registro
router.delete("/:id", requireAdmin, excluirRelatorio);

// Gerar PDF completo
router.get("/pdf", requireAdmin, gerarPDF);

// Gerar PDF filtrado
router.post("/pdf-filtrado", requireAdmin, gerarPDFFiltrado);

export default router;
