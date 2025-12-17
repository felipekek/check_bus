// backend/src/controllers/feedbackController.js
import { db } from "../config/firebase-admin.js";
import nodemailer from "nodemailer";

/**
 * Enviar feedback (qualquer usuário)
 */
export const enviarFeedback = async (req, res) => {
  try {
    let { nome, cpf, comentario, email } = req.body;

    if (!nome || !comentario) {
      return res
        .status(400)
        .json({ erro: "Preencha todos os campos obrigatórios!" });
    }

    if (!email) email = null;
    if (!cpf) cpf = "000.000.000-00";

    await db.collection("feedback").add({
      nome,
      cpf,
      email,
      comentario,
      data: new Date().toISOString(),

      // 🔥 CONTROLE DE STATUS
      lido: false,
      respondido: false,
    });

    return res.status(201).json({ mensagem: "Feedback enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar feedback:", error);
    return res.status(500).json({ erro: "Erro ao salvar feedback." });
  }
};

/**
 * Listar feedbacks (somente admin)
 */
export const listarFeedbacks = async (_req, res) => {
  try {
    const snapshot = await db
      .collection("feedback")
      .orderBy("data", "desc")
      .get();

    const feedbacks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Erro ao listar feedbacks:", error);
    return res.status(500).json({ erro: "Erro ao listar feedbacks." });
  }
};

/**
 * Excluir feedback (somente admin)
 */
export const excluirFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: "ID do feedback não informado." });
    }

    await db.collection("feedback").doc(id).delete();

    return res
      .status(200)
      .json({ mensagem: "Feedback excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir feedback:", error);
    return res.status(500).json({ erro: "Erro ao excluir feedback." });
  }
};

/**
 * Marcar feedback como lido (somente admin)
 */
export const marcarComoLido = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("feedback").doc(id).update({
      lido: true,
    });

    return res.status(200).json({ mensagem: "Feedback marcado como lido." });
  } catch (error) {
    console.error("Erro ao marcar como lido:", error);
    return res.status(500).json({ erro: "Erro ao marcar como lido." });
  }
};

/**
 * Responder feedback por e-mail (somente admin)
 */
export const responderFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { mensagem } = req.body;

    if (!mensagem) {
      return res
        .status(400)
        .json({ erro: "Mensagem da resposta não informada." });
    }

    const doc = await db.collection("feedback").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ erro: "Feedback não encontrado." });
    }

    const feedback = doc.data();

    if (!feedback.email) {
      return res
        .status(400)
        .json({ erro: "Este feedback não possui email para resposta." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // senha de app
      },
    });

    await transporter.sendMail({
      from: `"CheckBus" <${process.env.EMAIL_USER}>`,
      to: feedback.email,
      subject: "Resposta ao seu feedback - CheckBus",
      html: `
        <p>Olá <strong>${feedback.nome}</strong>,</p>
        <p>Recebemos seu feedback e agradecemos pelo contato.</p>
        <p><strong>Nossa resposta:</strong></p>
        <hr />
        <p>${mensagem}</p>
        <hr />
        <p>Atenciosamente,<br/>Equipe CheckBus 🚍</p>
      `,
    });

    // ✅ MARCA COMO RESPONDIDO
    await db.collection("feedback").doc(id).update({
      respondido: true,
      lido: true,
    });

    return res.status(200).json({ mensagem: "Resposta enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao responder feedback:", error);
    return res
      .status(500)
      .json({ erro: "Erro ao enviar resposta por email." });
  }
};
