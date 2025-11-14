// backend/src/controllers/OnibusController.js
import { db } from "../config/firebase-admin.js";

export const cadastrarOnibus = async (req, res) => {
  try {
    const {
      numero,
      placa,
      modelo,
      ano,
      capacidade,
      tipo,
      status,
      observacoes
    } = req.body;

    // Validação de campos
    if (!numero || !placa || !modelo || !ano || !capacidade || !tipo || !status) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios!" });
    }

    let fotoURL = null;

    // Se veio foto, vamos ignorar por enquanto (você quer fazer isso depois)
    if (req.file) {
      fotoURL = "upload-pendente"; // só para não ignorar
    }

    await db.collection("onibus").add({
      numero,
      placa,
      modelo,
      ano: Number(ano),
      capacidade: Number(capacidade),
      tipo,
      status,
      observacoes: observacoes || "",
      fotoURL,
      criadoEm: new Date()
    });

    return res.status(201).json({ mensagem: "Ônibus cadastrado com sucesso!" });

  } catch (erro) {
    console.error("❌ Erro ao cadastrar ônibus:", erro);
    return res.status(500).json({ erro: "Erro ao cadastrar ônibus. Tente novamente." });
  }
};
