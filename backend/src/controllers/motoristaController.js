// backend/src/controllers/motoristaController.js
import { db } from "../config/firebase-admin.js";

/**
 * Controlador de cadastro de motorista
 * Salva os dados no Firestore, na coleção 'motoristas'
 */
export const cadastrarMotorista = async (req, res) => {
  try {
    const {
      nome,
      email,
      cpf,
      telefone,
      cnh,
      categoria,
      validadeCnh,
      turno,
      status,
      senha,
    } = req.body;

    // Verifica campos obrigatórios
    if (!nome || !email || !cpf || !telefone || !cnh || !categoria || !validadeCnh || !turno || !status) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios!" });
    }

    // Cria documento no Firestore
    await db.collection("motoristas").add({
      nome,
      email,
      cpf,
      telefone,
      cnh,
      categoria,
      validadeCnh,
      turno,
      status,
      senha,
      criadoEm: new Date().toISOString(),
    });

    return res.status(201).json({ mensagem: "Motorista cadastrado com sucesso!" });
  } catch (erro) {
    console.error("❌ Erro ao cadastrar motorista:", erro);
    return res.status(500).json({ erro: "Erro ao cadastrar motorista. Tente novamente." });
  }
};
