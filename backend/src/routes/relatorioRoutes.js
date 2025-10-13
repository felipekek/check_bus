// backend/src/routes/relatorioRoutes.js
import express from "express";
import { listarRelatorios, excluirRelatorio } from "../controllers/relatorioController.js";
import { gerarPDF } from "../controllers/pdfController.js";
import { verificarAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /relatorios → lista acessos (somente admin)
router.get("/", verificarAdmin, listarRelatorios);

// DELETE /relatorios/:id → exclui registro pelo ID (somente admin)
router.delete("/:id", verificarAdmin, excluirRelatorio);

// GET /relatorios/pdf → gera e baixa PDF (com ou sem filtros)
router.get("/pdf", verificarAdmin, gerarPDF);

export default router;
