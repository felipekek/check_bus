// backend/src/controllers/historicoController.js
import { db } from "../config/firebase-admin.js";

/**
 * Histórico de embarque do aluno logado
 * Fonte: coleção "acessos"
 */
export async function listarHistoricoAluno(req, res) {
  try {
    // uid extraído do token verificado pelo middleware requireAuth
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(400).json({ error: "UID não encontrado no token." });
    }

    const acessosRef = db
      .collection("acessos")
      .where("uid", "==", uid)
      .orderBy("data", "desc");

    const snapshot = await acessosRef.get();

    if (snapshot.empty) return res.json([]);

    const lista = snapshot.docs.map(doc => {
      const dados = doc.data();

      return {
        id: doc.id,
        idCartao: dados.idCartao || "-",
        data: dados.data || "-",
        horario: dados.horario || "-"
      };
    });

    return res.json(lista);

  } catch (error) {
    console.error("Erro ao listar histórico:", error);
    return res.status(500).json({ error: "Erro ao carregar histórico do aluno." });
  }
}
