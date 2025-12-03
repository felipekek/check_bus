// backend/src/middlewares/authMiddleware.js

import admin from "../config/firebase-admin.js";

/**
 * Extrai o token do header Authorization
 */
function extractBearer(req) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * 🔐 Middleware: Verifica se o usuário está autenticado
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractBearer(req);

    if (!token) {
      return res.status(401).json({ erro: "Token não fornecido" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded; // UID, email, claims do Firebase
    next();
  } catch (err) {
    console.error("❌ requireAuth:", err);
    return res.status(401).json({ erro: "Token inválido" });
  }
}

/**
 * 🔐🔥 Alias opcional para compatibilidade
 * (caso seu projeto use authMiddleware)
 */
export const authMiddleware = requireAuth;
