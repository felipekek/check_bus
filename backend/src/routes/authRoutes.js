// backend/src/routes/authRoutes.js
// ============================================================
// Rotas de autenticação e dados de usuários (alunos e admins)
// Sistema: CheckBus
// Autor: Luís Felipe (TCC)
// ------------------------------------------------------------
// Endpoints:
//  - POST /auth/login        → Login de usuário
//  - POST /auth/cadastro     → Cadastro de aluno
//  - GET  /auth/usuario/:uid → Retorna dados de um aluno
//  - GET  /auth/staff/:uid   → Retorna dados de um administrador
// ============================================================

import express from "express";
import {
  loginUsuario,
  cadastrarUsuario,
  getUsuario,
  getStaffUsuario, // ✅ novo controlador
} from "../controllers/authController.js";

const router = express.Router();

// Login
router.post("/login", loginUsuario);

// Cadastro
router.post("/cadastro", cadastrarUsuario);

// Buscar dados do aluno pelo UID
router.get("/usuario/:uid", getUsuario);

// Buscar dados do administrador (staff) pelo UID
router.get("/staff/:uid", getStaffUsuario);

export default router;
