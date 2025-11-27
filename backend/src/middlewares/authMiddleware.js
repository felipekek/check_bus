// backend/src/middlewares/authMiddleware.js
import  admin  from "../config/firebase-admin.js";

/**
 * Extrai o token do header Authorization: Bearer <token>
 */
function extractBearer(req) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Middleware para verificar autenticação via Firebase Admin.
 * Adiciona o token decodificado em req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractBearer(req);
    if (!token) {
      return res.status(401).json({ erro: "Token não fornecido" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // uid, email, claims
    next();
  } catch (err) {
    console.error("❌ requireAuth:", err);
    res.status(401).json({ erro: "Token inválido" });
  }
}

/**
 * Middleware para permitir apenas administradores.
 * Verifica se o e-mail é do staff ou se há claim admin=true.
 */
export function requireAdmin(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ erro: "Não autenticado" });
    }

    const email = (user.email || "").toLowerCase();
    const isAdminEmail = email === "staff@adm.com";
    const isAdminClaim =
      user.admin === true || (user.customClaims && user.customClaims.admin);

    if (!isAdminEmail && !isAdminClaim) {
      return res.status(403).json({ erro: "Acesso negado (somente admin)" });
    }

    next();
  } catch (err) {
    console.error("❌ requireAdmin:", err);
    res.status(403).json({ erro: "Acesso negado" });
  }
}

/** Alias antigo para compatibilidade (caso usado em outros arquivos) */
export const verificarAdmin = requireAdmin;
