import express from "express";
import { listarRelatorios, excluirRelatorio } from "../controllers/relatorioController.js";
import { verificarAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /relatorios → lista acessos (só admin)
router.get("/", verificarAdmin, listarRelatorios);

// DELETE /relatorios/:id → exclui registro pelo ID (só admin)
router.delete("/:id", verificarAdmin, excluirRelatorio);

export default router;
