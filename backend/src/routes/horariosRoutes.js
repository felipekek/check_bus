// backend/src/routes/horariosRoutes.js
import express from "express";
import {
  // Legado
  salvarHorario,
  listarHorarios,
  excluirHorario,
  // Admin
  adminGetMonth,
  adminSetMonth,
  // Usuário (novo modelo)
  userGetMonth,
  userSetMonth,
  userToggleDay,
  userCopyMonth,
  userClearMonth,
  // NOVO: excluir uma data específica do mês
  userDeleteDate,
} from "../controllers/horariosController.js";

import {
  requireAuth,
  requireAdmin,
  mustBeSelf,
  mustMatchBodyUid,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ========= ROTAS ANTIGAS (LEGADO) ========= */
router.post("/salvar", requireAuth, salvarHorario);
router.get("/listar/:userId", requireAuth, listarHorarios);
router.delete("/excluir", requireAuth, excluirHorario);

/* ========= ROTAS NOVAS ========= */
// --- ADMIN ---
router.get("/admin/:ym", requireAuth, requireAdmin, adminGetMonth);
router.put("/admin/:ym", requireAuth, requireAdmin, adminSetMonth);

// --- USUÁRIO ---
// Apagar UMA data específica do mês do usuário (coloque ANTES da rota de mês)
router.delete("/user/:uid/:ym/:date", requireAuth, mustBeSelf, userDeleteDate);

// Buscar e salvar mês
router.get("/user/:uid/:ym", requireAuth, mustBeSelf, userGetMonth);
router.put("/user/:uid/:ym", requireAuth, mustBeSelf, userSetMonth);

// Alternar um dia e copiar mês
router.patch("/user/:uid/:ym/:date", requireAuth, mustBeSelf, userToggleDay);
router.post("/user/copy", requireAuth, mustMatchBodyUid, userCopyMonth);

// Apagar/limpar o mês inteiro do usuário
router.delete("/user/:uid/:ym", requireAuth, mustBeSelf, userClearMonth);

export default router;
