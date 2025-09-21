import express from "express";
import { gerarPDF } from "../controllers/pdfController.js";
import { verificarAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /pdf → gera e baixa PDF (só admin)
router.get("/pdf", verificarAdmin, gerarPDF);

export default router;
