// backend/src/routes/alunoRoutes.js

import express from "express";
import { vincularCartaoAluno } from "../controllers/alunoController.js";

const router = express.Router();

/**
 * Rota para vincular um cartão RFID a um aluno
 * body esperado:
 * {
 *   uidAluno: "UID do Firebase Auth",
 *   uidCartao: "UID lido do cartão RFID"
 * }
 */
router.post("/vincular-cartao", vincularCartaoAluno);

// Exporta as rotas
export default router;
