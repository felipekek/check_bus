/**
 * Rotas para gerenciamento dos feedbacks
 * Sistema: CheckBus
 * Autor: Luís Felipe (TCC)
 */

import express from "express";
import { enviarFeedback, listarFeedbacks } from "../controllers/feedbackController.js";

const router = express.Router();

/**
 * @route POST /feedback
 * @desc Enviar um novo feedback (usuário ou admin)
 */
router.post("/", enviarFeedback);

/**
 * @route GET /feedback
 * @desc Listar todos os feedbacks (painel do admin)
 */
router.get("/", listarFeedbacks);

export default router;
