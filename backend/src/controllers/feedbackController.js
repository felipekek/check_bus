// backend/src/controllers/feedbackController.js
import { db } from "../config/firebase-admin.js";

/**
 * Enviar feedback (qualquer usuário)
 */
export const enviarFeedback = async (req, res) => {
  try {
    let { nome, cpf, comentario, email } = req.body;

    if (!nome || !comentario) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios!" });
    }

    if (!email) email = null;
    if (!cpf) cpf = "000.000.000-00";

    await db.collection("feedback").add({
      nome,
      cpf,
      email,
      comentario,
      data: new Date().toISOString(),
    });

    return res.status(201).json({ mensagem: "Feedback enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar feedback:", error);
    return res.status(500).json({ erro: "Erro ao salvar feedback." });
  }
};

/**
 * Listar feedbacks (use middleware requireAdmin na rota)
 */
export const listarFeedbacks = async (_req, res) => {
  try {
    const snapshot = await db.collection("feedback").get();
    const feedbacks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Erro ao listar feedbacks:", error);
    return res.status(500).json({ erro: "Erro ao listar feedbacks." });
  }
};
