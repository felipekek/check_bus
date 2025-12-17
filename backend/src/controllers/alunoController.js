import { db } from "../config/firebase-admin.js";

/**
 * Vincular cartão RFID ao aluno
 * - Atualiza alunos/{uidAluno}.idCartao
 * - Atualiza cpfLookup/{cpf}.idCartao (docId = cpf formatado, ex: 089.177.115-88)
 */
export const vincularCartaoAluno = async (req, res) => {
  try {
    const { uidAluno, uidCartao } = req.body;

    if (!uidAluno || !uidCartao) {
      return res.status(400).json({ erro: "Dados incompletos." });
    }

    // 1) Buscar o aluno para pegar o CPF
    const alunoRef = db.collection("alunos").doc(uidAluno);
    const alunoSnap = await alunoRef.get();

    if (!alunoSnap.exists) {
      return res.status(404).json({ erro: "Aluno não encontrado." });
    }

    const aluno = alunoSnap.data();
    const cpf = (aluno?.cpf || "").trim();

    if (!cpf) {
      return res.status(400).json({ erro: "Aluno não possui CPF salvo no cadastro." });
    }

    // 2) Atualizar as duas coleções em batch (tudo ou nada)
    const batch = db.batch();

    // alunos/{uidAluno}
    batch.update(alunoRef, { idCartao: uidCartao });

    // cpfLookup/{cpf}
    // IMPORTANTE: isso pressupõe que o docId do cpfLookup é o CPF formatado (igual o Arduino consulta)
    const cpfLookupRef = db.collection("cpfLookup").doc(cpf);

    // Se o doc já existe, update funciona; se pode não existir, use set merge pra não estourar erro.
    batch.set(cpfLookupRef, { idCartao: uidCartao, uid: uidAluno }, { merge: true });

    await batch.commit();

    return res.json({
      sucesso: true,
      mensagem: "Cartão RFID vinculado com sucesso! (alunos + cpfLookup atualizados)"
    });

  } catch (error) {
    console.error("Erro ao vincular cartão:", error);
    return res.status(500).json({ erro: "Erro ao vincular cartão." });
  }
};
