
// backend/src/controllers/avisosController.js
import { dbAdmin } from "../firebase-admin.js";
import { FieldValue } from "firebase-admin/firestore";

/* =====================================================
   LISTAR TODOS OS AVISOS
===================================================== */
export async function listarAvisos(req, res) {
  try {
    const snapshot = await dbAdmin.collection("avisos").orderBy("dataEnvio", "desc").get();
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar avisos:", err);
    res.status(500).json({ error: "Erro ao listar avisos." });
  }
}

/* =====================================================
   CRIAR AVISO
===================================================== */
export async function criarAviso(req, res) {
  try {
    const { titulo, mensagem, turnos } = req.body;

    if (!titulo || !mensagem || !turnos || !turnos.length) {
      return res.status(400).json({ error: "Dados incompletos." });
    }

    const batch = dbAdmin.batch();

    turnos.forEach(turno => {
      const ref = dbAdmin.collection("avisos").doc();
      batch.set(ref, {
        titulo,
        mensagem,
        turno,
        tipo: "personalizado",
        dataEnvio: FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    res.json({ success: true, msg: "Aviso criado com sucesso!" });
  } catch (err) {
    console.error("Erro ao criar aviso:", err);
    res.status(500).json({ error: "Erro ao criar aviso." });
  }
}

/* =====================================================
   DELETAR AVISO
===================================================== */
export async function deletarAviso(req, res) {
  try {
    const { id } = req.params;

    await dbAdmin.collection("avisos").doc(id).delete();

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao deletar aviso:", err);
    res.status(500).json({ error: "Erro ao deletar aviso." });
  }
}
