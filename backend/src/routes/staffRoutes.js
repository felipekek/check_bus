// backend/src/routes/staffRoutes.js
// Rotas auxiliares para staff (opcional; hoje você já usa custom claim admin)

import express from "express";
import { getStaffUsuario } from "../controllers/staffController.js";

const router = express.Router();

// Busca dados de staff por e-mail (coleção "staff")
router.get("/:email", getStaffUsuario);

export default router;
