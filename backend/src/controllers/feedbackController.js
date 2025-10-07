/**
 * Controller responsável por gerenciar os feedbacks dos usuários e administradores
 * Sistema: CheckBus
 * Autor: Luís Felipe (TCC)
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
    const { nome, cpf, comentario, email } = req.body;

    // Validação: nome e comentário são obrigatórios
    if (!nome || !comentario) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios!" });
    }

    // Permitir envio sem CPF (caso o remetente seja um administrador)
    await addDoc(collection(db, "feedback"), {
      nome,
      cpf: cpf || null, // CPF é opcional
      email: email || null, // Se quiser identificar o admin
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
