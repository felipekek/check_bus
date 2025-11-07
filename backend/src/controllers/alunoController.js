// controllers/alunoController.js
import { db } from "../config/firebase-admin.js";
import { getAuth } from "firebase-admin/auth";

/* LISTAR ALUNOS */
export async function listarAlunos(_req, res) {
  try {
    const alunosSnap = await db.collection("alunos").get();
    if (alunosSnap.empty) return res.json([]);

    const lista = await Promise.all(
      alunosSnap.docs.map(async (alunoDoc) => {
        const aluno = alunoDoc.data();
        const alunoId = alunoDoc.id;

        const horariosSnap = await db
          .collection("horarios")
          .doc(alunoId)
          .collection("listaHorarios")
          .get();

        const horarios = horariosSnap.docs.map((h) => {
          const d = h.data();
          return {
            dia: d.titulo || "Dia não informado",
            horario: d.horario || "Horário não informado",
          };
        });

        return {
          id: alunoId,
          nome: aluno.nome || "-",
          cpf: aluno.cpf || "-",
          telefone: aluno.telefone || "-",
          email: aluno.email || "-",
          curso: aluno.curso || "-",
          turno: aluno.turno || "-",
          periodo: aluno.periodo || "-",
          instituicao: aluno.instituicao || "-",
          ultimoLogin: aluno.ultimoLogin || "-",
          horarios: horarios.length > 0 ? horarios : [],
        };
      })
    );

    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar alunos:", err);
    res.status(500).json({ error: "Erro ao listar alunos" });
  }
}

/* EXCLUIR ALUNO */
export async function excluirAluno(req, res) {
  try {
    const { id } = req.params;

    await getAuth().deleteUser(id);

    await db.collection("alunos").doc(id).delete();

    const horariosSnap = await db
      .collection("horarios")
      .doc(id)
      .collection("listaHorarios")
      .get();

    const batch = db.batch();
    horariosSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    res.json({ message: "Aluno e seus dados foram excluídos com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir aluno:", err);
    res.status(500).json({ error: "Erro ao excluir aluno" });
  }
}