// backend/src/routes/adminRoutes.js
import express from "express";
import { listarAlunos, excluirAluno } from "../controllers/adminController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// Lista todos os alunos (somente admin)
router.get("/", requireAdmin, listarAlunos);

// Exclui aluno (Auth + Firestore + horários) (somente admin)
router.delete("/:id", requireAdmin, excluirAluno);

export default router;
