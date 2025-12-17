// backend/src/routes/feedbackRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import {
  enviarFeedback,
  listarFeedbacks,
  excluirFeedback,
  responderFeedback,
  marcarComoLido,
} from "../controllers/feedbackController.js";

const router = express.Router();

// Enviar feedback (qualquer usuário)
router.post("/", enviarFeedback);

// Listar feedbacks (somente admin)
router.get("/", requireAdmin, listarFeedbacks);

// Excluir feedback (somente admin)
router.delete("/:id", requireAdmin, excluirFeedback);

// Marcar feedback como lido (somente admin)
router.patch("/:id/lido", requireAdmin, marcarComoLido);

// Responder feedback (somente admin)
router.post("/:id/responder", requireAdmin, responderFeedback);

export default router;
