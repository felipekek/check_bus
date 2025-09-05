// backend/src/routes/authRoutes.js
// Rotas relacionadas à autenticação

import express from "express";
import { loginUsuario, cadastrarUsuario } from "../controllers/authController.js";

const router = express.Router();

// Endpoint POST /auth/login → login de usuário
router.post("/login", loginUsuario);

// Endpoint POST /auth/cadastro → cadastro de usuário
router.post("/cadastro", cadastrarUsuario);

export default router;
