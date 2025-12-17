// backend/src/controllers/historicoController.js
import { db } from "../config/firebase-admin.js";

/**
 * Histórico de embarque do aluno logado
 * Lê a coleção "acessos" filtrando pelo idCartao do aluno
 */
export async function listarHistoricoAluno(req, res) {
  try {
    const uidAluno = req.user?.uid;

    if (!uidAluno) {
      return res.status(400).json({
        semCartao: false,
        historico: [],
        error: "UID do aluno não encontrado no token."
      });
    }

    // ================================
    // 1. Buscar aluno
    // ================================
    const alunoSnap = await db.collection("alunos").doc(uidAluno).get();

    if (!alunoSnap.exists) {
      return res.status(404).json({
        semCartao: false,
        historico: [],
        error: "Aluno não encontrado."
      });
    }

    const aluno = alunoSnap.data();

    // ================================
    // 2. Aluno SEM cartão
    // ================================
    if (!aluno.idCartao) {
      return res.json({
        semCartao: true,
        historico: []
      });
    }

    const idCartao = aluno.idCartao;

    // ================================
    // 3. Buscar acessos do cartão
    // ================================
    const snapshot = await db
      .collection("acessos")
      .where("uid", "==", idCartao) // uid = idCartao gravado pelo ESP32
      .orderBy("data", "desc")
      .get();

    if (snapshot.empty) {
      return res.json({
        semCartao: false,
        historico: []
      });
    }

    const historico = snapshot.docs.map(doc => {
      const dados = doc.data();
      return {
        id: doc.id,
        idCartao,
        data: dados.data || "-",
        horario: dados.horario || "-"
      };
    });

    return res.json({
      semCartao: false,
      historico
    });

  } catch (error) {
    console.error("Erro ao listar histórico:", error);
    return res.status(500).json({
      semCartao: false,
      historico: [],
      error: "Erro ao carregar histórico do aluno."
    });
  }
}
