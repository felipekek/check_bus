import { db } from "../config/firebase-admin.js";

/**
 * Vincular cartão RFID ao aluno
 * Salva o UID do cartão no campo CORRETO: idCartao
 */
export const vincularCartaoAluno = async (req, res) => {
  try {
    const { uidAluno, uidCartao } = req.body;

    // Validação básica
    if (!uidAluno || !uidCartao) {
      return res.status(400).json({ erro: "Dados incompletos." });
    }

    // Atualiza o campo correto no Firestore
    await db.collection("alunos").doc(uidAluno).update({
      idCartao: uidCartao
    });

    // Resposta de sucesso
    return res.json({
      sucesso: true,
      mensagem: "Cartão RFID vinculado com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao vincular cartão:", error);
    return res.status(500).json({ erro: "Erro ao vincular cartão." });
  }
};
