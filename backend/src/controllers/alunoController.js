import { db } from "../config/firebase-admin.js";

export const vincularCartaoAluno = async (req, res) => {
  try {
    const { uidAluno, uidCartao } = req.body;

    if (!uidAluno || !uidCartao) {
      return res.status(400).json({ erro: "Dados incompletos." });
    }

    await db.collection("alunos").doc(uidAluno).update({
      uid: uidCartao
    });

    return res.json({
      sucesso: true,
      mensagem: "Cartão RFID vinculado com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao vincular cartão:", error);
    return res.status(500).json({ erro: "Erro ao vincular cartão." });
  }
};
