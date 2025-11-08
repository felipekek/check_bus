// backend/src/routes/motoristaRoutes.js
import express from "express";
import { cadastrarMotorista } from "../controllers/motoristaController.js";

const router = express.Router();

// Cadastro de motorista (sem autenticação)
router.post("/cadastrar", cadastrarMotorista);

export default router;
