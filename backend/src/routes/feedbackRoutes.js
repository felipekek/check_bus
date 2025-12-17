// backend/src/routes/feedbackRoutes.js
import express from "express";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import {
  enviarFeedback,
  listarFeedbacks,
  excluirFeedback,
  responderFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

// Envia feedback (qualquer usuário)
router.post("/", enviarFeedback);

// Lista feedbacks (somente admin)
router.get("/", requireAdmin, listarFeedbacks);

// Excluir feedback (somente admin)
router.delete("/:id", requireAdmin, excluirFeedback);

// Responder feedback por email (somente admin)
router.post("/:id/responder", requireAdmin, responderFeedback);

export default router;
