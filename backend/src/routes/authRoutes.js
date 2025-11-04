// backend/src/routes/authRoutes.js
// Endpoints de autenticação/cadastro e leitura básica de perfis

import express from "express";
import {
  loginUsuario,
  cadastrarUsuario,
  getUsuario,
  getStaffUsuario,
  atualizarEmailUsuario,
} from "../controllers/authController.js";

const router = express.Router();

// Login
router.post("/login", loginUsuario);

// Cadastro
router.post("/cadastro", cadastrarUsuario);

// Atualiza e-mail (fluxo com reautenticação por senha no controller)
router.post("/atualizar-email", atualizarEmailUsuario);

// Dados do aluno por UID
router.get("/usuario/:uid", getUsuario);

// Dados do staff por UID (mantido para compatibilidade)
router.get("/staff/:uid", getStaffUsuario);

export default router;
