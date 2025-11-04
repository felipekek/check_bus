// backend/src/controllers/staffController.js
import { db } from "../config/firebase-admin.js";

// GET /auth/staff/:email
export const getStaffUsuario = async (req, res) => {
  const email = req.params.email;

  try {
    if (!email) return res.status(400).json({ erro: "Email não informado!" });

    const snap = await db.collection("staff").where("email", "==", email).get();
    if (snap.empty) return res.status(404).json({ erro: "Administrador não encontrado!" });

    const data = snap.docs[0].data();
    res.status(200).json({ email: data.email });
  } catch (error) {
    console.error("Erro ao buscar dados do staff:", error);
    res.status(500).json({ erro: "Erro interno ao buscar administrador." });
  }
};
