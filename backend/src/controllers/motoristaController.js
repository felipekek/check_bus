// backend/src/controllers/motoristaController.js
import { db } from "../config/firebase-admin.js";
import { getAuth } from "firebase-admin/auth";

/* Lista todos os motoristas (usuarios com tipoUsuario === "motorista") */
export const listarMotoristas = async (req, res) => {
  try {
    const motoristasSnap = await db
      .collection("usuarios")
      .where("tipoUsuario", "==", "motorista")
      .get();

    const motoristas = motoristasSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(motoristas);
  } catch (err) {
    console.error("Erro ao buscar motoristas:", err);
    res.status(500).json({ erro: "Erro ao buscar motoristas" });
  }
};

/* Exclui motorista: Auth + Firestore + subcoleções */
export const excluirMotorista = async (req, res) => {
  try {
    const { id } = req.params;

    // Apaga usuário do Firebase Auth (se existir)
    try {
      await getAuth().deleteUser(id);
    } catch (e) {
      console.warn(`Usuário ${id} não encontrado no Auth ou já excluído.`);
    }

    // Apaga subcoleções (exemplo: horarios)
    const subcolecoes = ["horarios", "rotas"];
    for (const sub of subcolecoes) {
      const snap = await db.collection("usuarios").doc(id).collection(sub).get();
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Apaga o documento principal
    await db.collection("usuarios").doc(id).delete();

    res.json({ sucesso: true, mensagem: "Motorista excluído com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir motorista:", err);
    res.status(500).json({ erro: "Erro ao excluir motorista" });
  }
};


