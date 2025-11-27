// backend/src/routes/historicoRoutes.js
import express from "express";
import { listarHistoricoAluno } from "../controllers/historicoController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apenas aluno autenticado pode acessar
router.get("/", requireAuth, listarHistoricoAluno);

export default router;
