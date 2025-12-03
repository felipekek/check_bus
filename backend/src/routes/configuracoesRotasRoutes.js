// backend/src/routes/configuracoesRotasRoutes.js

import express from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { ConfiguracoesRotasController } from "../controllers/ConfiguracoesRotasController.js";

const router = express.Router();

// Todas as rotas protegidas para ADMIN
router.get("/", requireAdmin, ConfiguracoesRotasController.listar);
router.post("/", requireAdmin, ConfiguracoesRotasController.criar);
router.put("/:id", requireAdmin, ConfiguracoesRotasController.atualizar);
router.delete("/:id", requireAdmin, ConfiguracoesRotasController.excluir);

export default router;
