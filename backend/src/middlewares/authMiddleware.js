// Middleware que protege rotas de admin
import { auth } from "../config/firebase-config.js";

export const verificarAdmin = async (req, res, next) => {
  try {
    // Pega token do header Authorization → "Bearer <token>"
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ erro: "Token não fornecido" });

    // Decodifica token do Firebase
    const decoded = await auth.verifyIdToken(token);

    // Verifica se é o admin
    if (decoded.email.toLowerCase() !== "staff@adm.com") {
      return res.status(403).json({ erro: "Acesso negado" });
    }

    // Salva informações do usuário na requisição
    req.user = decoded;

    // Continua para a rota
    next();
  } catch (err) {
    res.status(401).json({ erro: "Token inválido" });
  }
};
