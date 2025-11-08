// backend/src/middlewares/requireAdmin.js
import admin from "../config/firebase-admin.js";

export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return res.status(401).json({ error: "Sem token" });

    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.admin) return res.status(403).json({ error: "Acesso negado (admin apenas)" });

    req.user = decoded; // opcional
    next();
  } catch (e) {
    console.error("Auth admin error:", e);
    return res.status(401).json({ error: "Token inválido" });
  }
}
