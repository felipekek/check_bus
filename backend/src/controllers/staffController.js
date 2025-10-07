// backend/src/controllers/staffController.js
// ============================================================
// Controller responsável por buscar dados do administrador
// Sistema: CheckBus
// Autor: Luís Felipe (TCC)
// ============================================================

import { db } from "../config/firebase-config.js";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * Função: getStaffUsuario
 * -----------------------------------------------------------
 * Busca administrador pelo email (não pelo UID)
 */
export const getStaffUsuario = async (req, res) => {
  const email = req.params.email;

  try {
    if (!email) return res.status(400).json({ erro: "Email não informado!" });

    const staffRef = collection(db, "staff");
    const q = query(staffRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ erro: "Administrador não encontrado!" });
    }

    const staffData = querySnapshot.docs[0].data();

    res.status(200).json({
      email: staffData.email,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do staff:", error);
    res.status(500).json({ erro: "Erro interno ao buscar administrador." });
  }
};
