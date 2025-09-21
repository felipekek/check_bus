// backend/src/controllers/relatorioController.js
import { db } from "../config/firebase-admin.js";

// Listar todos os relatórios
export async function listarRelatorios(req, res) {
  try {
    // 🔑 Busca os registros na coleção "acessos"
    const registrosRef = db.collection("acessos");
    const snapshot = await registrosRef.orderBy("data", "desc").get();

    if (snapshot.empty) return res.json([]);

    const lista = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const dados = docSnap.data();

        // Valores padrão caso não exista aluno vinculado
        let alunoData = {
          nome: "Desconhecido",
          curso: "-",
          instituicao: "-",
          periodo: "-",
          turno: "-",
          idCartao: "-" // fallback
        };

        // Se tiver UID, busca os dados do aluno
        if (dados.uid) {
          const alunoDoc = await db.collection("alunos").doc(dados.uid).get();
          if (alunoDoc.exists) {
            alunoData = { ...alunoData, ...alunoDoc.data() };
          }
        }

        return {
          id: docSnap.id,
          aluno: alunoData.nome || "Desconhecido",

          // 🔑 prioridade: primeiro o idCartao do acesso, depois o do aluno, senão "-"
          idCartao: dados.idCartao || alunoData.idCartao || "-",

          curso: alunoData.curso || "-",
          instituicao: alunoData.instituicao || "-",
          periodo: alunoData.periodo || "-",
          turno: alunoData.turno || "-",
          data: dados.data || new Date().toISOString().split("T")[0],
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
