import express from "express";
import { listarAlunos, excluirAluno } from "../controllers/adminController.js";

const router = express.Router();

// GET /admin → lista todos os alunos
router.get("/", listarAlunos);

// DELETE /admin/:id → exclui aluno pelo id
router.delete("/:id", excluirAluno);

export default router;
