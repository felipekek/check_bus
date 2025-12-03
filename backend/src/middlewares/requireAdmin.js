// backend/src/middlewares/requireAdmin.js

import admin from "../config/firebase-admin.js";

/**
 * 🔐 Middleware: Verifica se o usuário logado é ADMIN
 */
export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ erro: "Token não fornecido" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    // Admin por CLAIM → firebase-admin
    const isClaimAdmin =
      decoded.admin === true ||
      (decoded.customClaims && decoded.customClaims.admin);

    // Admin por e-mail fixo
    const isEmailAdmin =
      decoded.email && decoded.email.toLowerCase() === "staff@adm.com";

    if (!isClaimAdmin && !isEmailAdmin) {
      return res.status(403).json({ erro: "Acesso negado: somente admin." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ requireAdmin:", err);
    res.status(401).json({ erro: "Token inválido ou sem permissão." });
  }
}
