// backend/src/controllers/adminController.js
import { db } from "../config/firebase-config.js";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

// Lista todos os alunos cadastrados
export async function listarAlunos(req, res) {
  try {
    const alunosSnap = await getDocs(collection(db, "alunos"));

    if (alunosSnap.empty) {
      return res.json([]);
    }

    const lista = [];
    for (const alunoDoc of alunosSnap.docs) {
      const aluno = alunoDoc.data();
      const alunoId = alunoDoc.id;

      // Buscar horários do aluno na coleção separada 'horarios'
      const horariosSnap = await getDocs(collection(db, "horarios", alunoId, "listaHorarios"));
      const horarios = horariosSnap.docs.map(h => {
        const d = h.data();
        return `${d.titulo || ""} ${d.horario || ""}`.trim();
      });

      lista.push({
        id: alunoId,
        nome: aluno.nome || "-",
        email: aluno.email || "-",
        instituicao: aluno.instituicao || "-",
        ultimoLogin: aluno.ultimoLogin || "-",
        horarios: horarios.length > 0 ? horarios : []
      });
    }

    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar alunos:", err);
    res.status(500).json({ error: "Erro ao listar alunos" });
  }
}

// Excluir aluno + horários
export async function excluirAluno(req, res) {
  const { id } = req.params;
  try {
    // Apaga horários do aluno na coleção separada 'horarios'
    const horariosSnap = await getDocs(collection(db, "horarios", id, "listaHorarios"));
    const promises = horariosSnap.docs.map(hDoc =>
      deleteDoc(doc(db, "horarios", id, "listaHorarios", hDoc.id))
    );
    await Promise.all(promises);

    // Apaga aluno
    await deleteDoc(doc(db, "alunos", id));

    res.json({ message: "Aluno excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir aluno:", err);
    res.status(500).json({ error: "Erro ao excluir aluno" });
  }
}
