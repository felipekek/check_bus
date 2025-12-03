// backend/src/controllers/relatorioController.js
import admin from "../config/firebase-admin.js";

const db = admin.firestore();

/* ======================================================
   LISTAR RELATÓRIOS (coleção "acessos" + dados do aluno)
====================================================== */
export async function listarRelatorios(req, res) {
  try {
    const snapshot = await db.collection("acessos").orderBy("data", "desc").get();

    const lista = [];

    for (const doc of snapshot.docs) {
      const dados = doc.data();

      // UID do cartão (pode não existir → prevenir erro)
      const uidCartao = dados.uid ?? null;

      let alunoInfo = {
        aluno: "Sem UID cadastrado",
        curso: "-",
        instituicao: "-",
        periodo: "-",
        turno: "-",
      };

      // 🔥 Se o documento NÃO tiver UID, evitar erro e continuar
      if (!uidCartao) {
        lista.push({
          id: doc.id,
          idCartao: "Desconhecido",
          horario: dados.horario || "-",
          data: dados.data || "-",
          ...alunoInfo,
        });
        continue; // <-- evita que o Firestore quebre
      }

      // Buscar aluno pelo idCartao
      const alunoSnap = await db
        .collection("alunos")
        .where("idCartao", "==", uidCartao)
        .limit(1)
        .get();

      if (!alunoSnap.empty) {
        const aluno = alunoSnap.docs[0].data();
        alunoInfo = {
          aluno: aluno.nome || "-",
          curso: aluno.curso || "-",
          instituicao: aluno.instituicao || "-",
          periodo: aluno.periodo || "-",
          turno: aluno.turno || "-",
        };
      }

      lista.push({
        id: doc.id,
        idCartao: uidCartao,
        horario: dados.horario || "-",
        data: dados.data || "-",
        ...alunoInfo,
      });
    }

    return res.json(lista);
  } catch (error) {
    console.error("Erro ao listar relatórios:", error);
    return res.status(500).json({
      erro: "Erro ao buscar relatórios",
      detalhes: error.message,
    });
  }
}

/* ======================================================
   EXCLUIR RELATÓRIO (acessos)
====================================================== */
export async function excluirRelatorio(req, res) {
  try {
    const id = req.params.id;

    await db.collection("acessos").doc(id).delete();

    return res.json({ ok: true, mensagem: "Registro removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir relatório:", error);
    return res.status(500).json({ erro: "Erro ao excluir relatório" });
  }
}
