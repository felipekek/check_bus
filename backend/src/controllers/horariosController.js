// backend/src/controllers/horariosController.js
import { db } from "../config/firebase-config.js";
import { collection, doc, setDoc, addDoc, deleteDoc, getDocs } from "firebase/firestore";

// Adiciona novo horário ou edita existente
export const salvarHorario = async (req, res) => {
  try {
    const { userId, titulo, horario, horarioId } = req.body;

    if (!userId || !titulo || !horario) {
      return res.status(400).json({ erro: "Dados incompletos." });
    }

    const horariosRef = collection(db, "horarios", userId, "listaHorarios");

    if (horarioId) {
      const docRef = doc(horariosRef, horarioId);
      await setDoc(docRef, { titulo, horario }, { merge: true });
      return res.json({ mensagem: "Horário editado com sucesso!" });
    } else {
      await addDoc(horariosRef, { titulo, horario });
      return res.json({ mensagem: "Horário salvo com sucesso!" });
    }
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao salvar horário." });
  }
};

// Lista horários de um usuário
export const listarHorarios = async (req, res) => {
  try {
    const { userId } = req.params;
    const horariosRef = collection(db, "horarios", userId, "listaHorarios");
    const snapshot = await getDocs(horariosRef);

    const horarios = [];
    snapshot.forEach(docItem => {
      horarios.push({ id: docItem.id, ...docItem.data() });
    });

    res.json(horarios);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar horários." });
  }
};

// Excluir horário
export const excluirHorario = async (req, res) => {
  try {
    const { userId, horarioId } = req.body;
    const horariosRef = doc(db, "horarios", userId, "listaHorarios", horarioId);
    await deleteDoc(horariosRef);
    res.json({ mensagem: "Horário excluído com sucesso!" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir horário." });
  }
};
