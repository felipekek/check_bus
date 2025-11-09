// backend/src/routes/horariosRoutes.js
import express from "express";
import {
  // Legado (listaHorarios por usuário)
  salvarHorario,
  listarHorarios,
  excluirHorario,

  // Calendário (Admin)
  adminGetMonth,
  adminSetMonth,

  // Calendário (Usuário)
  userGetMonth,
  userSetMonth,
  userToggleDay,
  userCopyMonth,
  userClearMonth,
  userDeleteDate,
} from "../controllers/horariosController.js";

import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

/* ========= ROTAS ANTIGAS (LEGADO) ========= */
// (Se quiser proteger, depois criamos um requireAuth)
router.post("/salvar", salvarHorario);
router.get("/listar/:userId", listarHorarios);
router.delete("/excluir", excluirHorario);

/* ========= CALENDÁRIO - ADMIN ========= */
router.get("/admin/:ym", requireAdmin, adminGetMonth);
router.put("/admin/:ym", requireAdmin, adminSetMonth);

/* ========= CALENDÁRIO - USUÁRIO ========= */
// (Podemos adicionar requireAuth/mustBeSelf depois, se desejar)
router.get("/user/:uid/:ym", userGetMonth);
router.put("/user/:uid/:ym", userSetMonth);

// Alterna um dia específico
router.patch("/user/:uid/:ym/:date", userToggleDay);

// Exclui uma data específica do mês
router.delete("/user/:uid/:ym/:date", userDeleteDate);

// Copia um mês para outro
router.post("/user/copy", userCopyMonth);

// Limpa o mês inteiro do usuário
router.delete("/user/:uid/:ym", userClearMonth);

export default router;