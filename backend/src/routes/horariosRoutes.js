// backend/src/routes/horariosRoutes.js
import express from "express";
import { salvarHorario, listarHorarios, excluirHorario } from "../controllers/horariosController.js";

const router = express.Router();

// Adiciona ou edita horário
router.post("/salvar", salvarHorario);

// Lista horários do usuário
router.get("/listar/:userId", listarHorarios);

// Excluir horário
router.delete("/excluir", excluirHorario);

export default router;
