// backend/src/controllers/historicoController.js
import { db } from "../config/firebase-admin.js";

/**
 * Histórico de embarque do aluno logado
 */
export async function listarHistoricoAluno(req, res) {
  try {
    // UID do aluno autenticado
    const uidAluno = req.user?.uid;

    if (!uidAluno) {
      return res.status(400).json({ error: "UID do aluno não encontrado no token." });
    }

    // ================================
    // 1. Buscar documento do aluno
    // ================================
    const alunoSnap = await db.collection("alunos").doc(uidAluno).get();

    if (!alunoSnap.exists) {
      return res.status(404).json({ error: "Aluno não encontrado no banco." });
    }

    const aluno = alunoSnap.data();

    if (!aluno.idCartao) {
      return res.status(400).json({ error: "Aluno não possui id do cartão vinculado." });
    }

    const idCartao = aluno.idCartao;

    // ================================
    // 2. Buscar acessos usando o ID do cartão
    // ================================
    const acessosRef = db
      .collection("acessos")
      .where("uid", "==", idCartao) // <-- IMPORTANTE: UID salva no Arduino É o ID do cartão
      .orderBy("data", "desc");

    const snapshot = await acessosRef.get();

    if (snapshot.empty) return res.json([]);

    const lista = snapshot.docs.map((doc) => {
      const dados = doc.data();

      return {
        id: doc.id,
        idCartao: idCartao, // cartão do aluno
        data: dados.data || "-",
        horario: dados.horario || "-",
      };
    });

    return res.json(lista);
  } catch (error) {
    console.error("Erro ao listar histórico:", error);
    return res.status(500).json({ error: "Erro ao carregar histórico do aluno." });
  }
}
