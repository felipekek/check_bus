/**
 * backend/src/controllers/feedbackController.js
 * ----------------------------------------------------------
 * Controller responsável por gerenciar os feedbacks dos usuários e administradores
 * Sistema: CheckBus
 * Autor: Luís Felipe (TCC)
 * ----------------------------------------------------------
 */

import { db } from "../config/firebase-config.js";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";

/**
 * Função: enviarFeedback
 * ----------------------------------------------------------
 * Objetivo:
 *  - Salvar um novo feedback na coleção "feedback"
 * Observação:
 *  - Aceita tanto usuários (com CPF) quanto administradores (sem CPF)
 */
export const enviarFeedback = async (req, res) => {
  try {
    let { nome, cpf, comentario, email } = req.body;

    // Validação: nome e comentário são obrigatórios
    if (!nome || !comentario) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios!" });
    }

    // Se for aluno e não enviar email, tenta pegar do localStorage (frontend deve enviar email)
    if (!email) email = null;

    // Se for admin e não enviar CPF, define padrão
    if (!cpf) cpf = "000.000.000-00";

    // Salva no Firestore
    await addDoc(collection(db, "feedback"), {
      nome,
      cpf,
      email,
      comentario,
      data: Timestamp.now(),
    });

    return res.status(201).json({ mensagem: "Feedback enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar feedback:", error);
    return res.status(500).json({ erro: "Erro ao salvar feedback." });
  }
};

/**
 * Função: listarFeedbacks
 * ----------------------------------------------------------
 * Objetivo:
 *  - Retornar todos os feedbacks para o painel do administrador
 */
export const listarFeedbacks = async (req, res) => {
  try {
    const feedbackRef = collection(db, "feedback");
    const snapshot = await getDocs(feedbackRef);

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
