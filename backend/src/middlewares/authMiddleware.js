// backend/src/middlewares/authMiddleware.js
import { admin } from "../config/firebase-admin.js";

/**
 * Extrai o ID token do header Authorization: Bearer <token>
 */
function extractBearer(req) {
  const authHeader = req.headers.authorization || "";
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

/**
 * Autentica o usuário via Firebase Admin e coloca o decoded token em req.user
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractBearer(req);
    if (!token) return res.status(401).json({ erro: "Token não fornecido" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // uid, email, claims, etc.
    return next();
  } catch (err) {
    console.error("requireAuth:", err);
    return res.status(401).json({ erro: "Token inválido" });
  }
}

/**
 * Verifica permissão de administrador.
 * Critérios:
 *  - email === 'staff@adm.com' (compatibilidade com seu código antigo)
 *  - OU custom claim admin === true (se você decidir usar claims)
 */
export function requireAdmin(req, res, next) {
  try {
    const u = req.user || {};
    const email = (u.email || "").toLowerCase();
    const isAdminEmail = email === "staff@adm.com";
    const isAdminClaim = !!u.admin || (u.customClaims && u.customClaims.admin);

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
 * Garante que o :uid da rota é o mesmo do usuário autenticado
 * Ex.: GET /horarios/user/:uid/:ym
 */
export function mustBeSelf(req, res, next) {
  try {
    const routeUid = req.params.uid;
    const authUid = req.user?.uid;
    if (!routeUid || !authUid || routeUid !== authUid) {
      return res.status(403).json({ erro: "Operação não permitida para este usuário" });
    }
    return next();
  } catch (err) {
    console.error("mustBeSelf:", err);
    return res.status(403).json({ erro: "Acesso negado" });
  }
}

/**
 * Garante que o body.uid é o mesmo do usuário autenticado
 * Ex.: POST /horarios/user/copy com { uid, fromYm, toYm }
 */
export function mustMatchBodyUid(req, res, next) {
  try {
    const bodyUid = req.body?.uid;
    const authUid = req.user?.uid;
    if (!bodyUid || !authUid || bodyUid !== authUid) {
      return res.status(403).json({ erro: "Operação não permitida para este usuário" });
    }
    return next();
  } catch (err) {
    console.error("mustMatchBodyUid:", err);
    return res.status(403).json({ erro: "Acesso negado" });
  }
}

/**
 * Alias para compatibilidade com código antigo:
 * adminRoutes.js importava { verificarAdmin }.
 * Exportamos esse nome apontando para o requireAdmin.
 */
export const verificarAdmin = requireAdmin;
