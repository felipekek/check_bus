// backend/src/routes/relatorioRoutes.js
import express from "express";
import { listarRelatorios, excluirRelatorio } from "../controllers/relatorioController.js";

const router = express.Router();

// GET /relatorios → lista acessos
router.get("/", listarRelatorios);

// DELETE /relatorios/:id → exclui registro pelo ID
router.delete("/:id", excluirRelatorio);

export default router;
