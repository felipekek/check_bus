// backend/src/controllers/relatorioController.js
import { db } from "../config/firebase-config.js";
import { collection, getDocs, doc, deleteDoc, query, orderBy } from "firebase/firestore";

// Lista todos os registros de acesso
export async function listarRelatorios(req, res) {
  try {
    const registrosRef = collection(db, "acessos");
    const q = query(registrosRef, orderBy("data", "desc")); // ordena por data

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.json([]);
    }

    const lista = snapshot.docs.map(docSnap => {
      const dados = docSnap.data();
      return {
        id: docSnap.id,
        uid: dados.uid || "UID Desconhecido",
        data: dados.data || "Data Desconhecida",
        horario: dados.horario || "Hora Desconhecida"
      };
    });

    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar relatórios:", err);
    res.status(500).json({ error: "Erro ao listar relatórios" });
  }
}

// Exclui registro pelo ID
export async function excluirRelatorio(req, res) {
  const { id } = req.params;
  try {
    await deleteDoc(doc(db, "acessos", id));
    res.json({ message: "Registro excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir relatório:", err);
    res.status(500).json({ error: "Erro ao excluir relatório" });
  }
}
