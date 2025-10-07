// backend/src/routes/staffRoutes.js
// ============================================================
// Rotas para gerenciar dados de administradores (staff)
// Sistema: CheckBus
// Autor: Luís Felipe (TCC)
// ============================================================

import express from "express";
import { getStaffUsuario } from "../controllers/staffController.js";

const router = express.Router();

/**
 * @route GET /auth/staff/:email
 * @desc Buscar dados de um administrador pelo email
 */
router.get("/:email", getStaffUsuario);

export default router;
