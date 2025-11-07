import express from "express";
import { requireAuth, verificarAdmin } from "../middlewares/authMiddleware.js";

import { listarAlunos, excluirAluno } from "../controllers/alunoController.js";
import { listarMotoristas, excluirMotorista } from "../controllers/motoristaController.js";
import { validarRequisitosMotorista } from "../controllers/adminController.js";

const router = express.Router();

/* ================================
   ROTAS DE ALUNOS (SOMENTE ADMIN)
=================================== */
router.get("/alunos", requireAuth, verificarAdmin, listarAlunos);
router.delete("/alunos/:id", requireAuth, verificarAdmin, excluirAluno);

/* ================================
   ROTAS DE MOTORISTAS (SOMENTE ADMIN)
=================================== */
router.get("/motoristas", requireAuth, verificarAdmin, listarMotoristas);
router.delete("/motoristas/:id", requireAuth, verificarAdmin, excluirMotorista);

/* ================================
   VALIDAÇÃO DE MOTORISTAS
=================================== */
router.post("/motoristas/validar", requireAuth, verificarAdmin, validarRequisitosMotorista);

export default router;
