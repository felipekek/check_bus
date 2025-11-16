// backend/src/routes/avisosRoutes.js
import express from "express";
import { listarAvisos, criarAviso, deletarAviso } from "../controllers/avisosController.js";

const router = express.Router();

/* ==========================
   ROTAS DE AVISOS
=========================== */
router.get("/", listarAvisos);
router.post("/", criarAviso);
router.delete("/:id", deletarAviso);

export default router;
