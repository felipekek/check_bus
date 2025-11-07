// backend/src/middlewares/authMiddleware.js
import { admin } from "../config/firebase-admin.js";

/**
 * Extrai o token JWT do header Authorization: Bearer <token>
 */
function extractBearer(req) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Autentica usuário via Firebase Admin
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractBearer(req);
    if (!token) {
      return res.status(401).json({ erro: "Token não fornecido" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // uid, email, claims etc.

    return next();
  } catch (err) {
    console.error("requireAuth:", err);
    return res.status(401).json({ erro: "Token inválido" });
  }
}

/**
 * Verifica permissão de administrador
 *  - email === 'staff@adm.com'
 *  - OU custom claim admin === true
 */
export function requireAdmin(req, res, next) {
  try {
    const u = req.user || {};
    const email = (u.email || "").toLowerCase();
    const isAdminEmail = email === "staff@adm.com";
    const isAdminClaim = !!u.admin || !!u.customClaims?.admin;

    if (!isAdminEmail && !isAdminClaim) {
      return res.status(403).json({ erro: "Acesso negado (admin requerido)" });
    }

    return next();
  } catch (err) {
    console.error("requireAdmin:", err);
    return res.status(403).json({ erro: "Acesso negado" });
  }
}

/**
 * Compatibilidade com seu código antigo
 * adminRoutes usa verificarAdmin
 */
export const verificarAdmin = requireAdmin;

/**
 * Garante que o UID da rota pertence ao usuário autenticado
 */
export function mustBeSelf(req, res, next) {
  try {
    const routeUid = req.params.uid;
    const authUid = req.user?.uid;

    if (!routeUid || !authUid || routeUid !== authUid) {
      return res
        .status(403)
        .json({ erro: "Operação não permitida para este usuário" });
    }

    return next();
  } catch (err) {
    console.error("mustBeSelf:", err);
    return res.status(403).json({ erro: "Acesso negado" });
  }
}

/**
 * Garante que o body.uid pertence ao usuário autenticado
 */
export function mustMatchBodyUid(req, res, next) {
  try {
    const bodyUid = req.body?.uid;
    const authUid = req.user?.uid;

    if (!bodyUid || !authUid || bodyUid !== authUid) {
      return res
        .status(403)
        .json({ erro: "Operação não permitida para este usuário" });
    }

    return next();
  } catch (err) {
    console.error("mustMatchBodyUid:", err);
    return res.status(403).json({ erro: "Acesso negado" });
  }
}
