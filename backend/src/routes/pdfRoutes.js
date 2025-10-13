import express from "express";
import { gerarPDF, gerarPDFFiltrado } from "../controllers/pdfController.js";
import { verificarAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * GET /relatorios/pdf
 * Gera e baixa o PDF completo (somente admin)
 */
router.get("/pdf", verificarAdmin, gerarPDF);

/**
 * POST /relatorios/pdf-filtrado
 * Gera e baixa o PDF apenas com os registros filtrados e colunas selecionadas
 */
router.post("/pdf-filtrado", verificarAdmin, gerarPDFFiltrado);

export default router;
