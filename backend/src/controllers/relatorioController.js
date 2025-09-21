// backend/src/controllers/relatorioController.js
import { db } from "../config/firebase-admin.js";

// Listar todos os relatórios
export async function listarRelatorios(req, res) {
  try {
    const registrosRef = db.collection("acessos");
    const snapshot = await registrosRef.orderBy("data", "desc").get();

    if (snapshot.empty) return res.json([]);

    const lista = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const dados = docSnap.data();

        // Valores padrão caso não exista o aluno
        let alunoData = {
          nome: "Desconhecido",
          idCartao: "-",
          curso: "-",
          instituicao: "-",
          periodo: "-",
          turno: "-"
        };

        // Busca aluno pelo uid
        if (dados.uid) {
          const alunoDoc = await db.collection("alunos").doc(dados.uid).get();
          if (alunoDoc.exists) {
            alunoData = alunoDoc.data();
          }
        }

        return {
          id: docSnap.id,
          aluno: alunoData.nome,
          idCartao: alunoData.idCartao || dados.idCartao || "-",
          curso: alunoData.curso,
          instituicao: alunoData.instituicao,
          periodo: alunoData.periodo,
          turno: alunoData.turno,
          data: dados.data || new Date().toISOString().split("T")[0], // Formato ISO YYYY-MM-DD
          horario: dados.horario || "-"
        };
      })
    );

    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar relatórios:", err);
    res.status(500).json({ error: "Erro ao listar relatórios" });
  }
}

// Excluir um relatório
export async function excluirRelatorio(req, res) {
  const { id } = req.params;
  try {
    await db.collection("acessos").doc(id).delete();
    res.json({ message: "Registro excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir relatório:", err);
    res.status(500).json({ error: "Erro ao excluir relatório" });
  }
}
