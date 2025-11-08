// backend/src/routes/feedbackRoutes.js
import express from "express";
import { enviarFeedback, listarFeedbacks } from "../controllers/feedbackController.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// Envia feedback (qualquer usuário)
router.post("/", enviarFeedback);

// Lista feedbacks (somente admin) — proteja o painel
router.get("/", requireAdmin, listarFeedbacks);

export default router;
