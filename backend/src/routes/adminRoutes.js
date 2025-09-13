import express from "express";
import { listarAlunos, excluirAluno } from "../controllers/adminController.js";
import { verificarAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /admin → lista todos os alunos (só admin)
router.get("/", verificarAdmin, listarAlunos);

// DELETE /admin/:id → exclui aluno pelo id (só admin)
router.delete("/:id", verificarAdmin, excluirAluno);

export default router;
