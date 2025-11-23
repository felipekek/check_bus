// backend/src/controllers/OnibusController.js
import { db } from "../config/firebase-admin.js";
import { supabase, BUCKET_ONIBUS } from "../config/supabase.js";

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

    if (!numero || !placa || !modelo || !ano || !capacidade || !tipo || !status) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios!" });
    }

    let fotoURL = null;

    // Se o usuário enviou a foto
    if (req.file) {
      const arquivo = req.file;
      const nomeArquivo = `onibus_${Date.now()}.jpeg`;

      // Upload no bucket correto
      const { data, error } = await supabase.storage
        .from(BUCKET_ONIBUS)
        .upload(nomeArquivo, arquivo.buffer, {
          contentType: arquivo.mimetype,
          upsert: false
        });

      if (error) {
        console.error("Erro ao enviar imagem:", error);
        return res.status(500).json({ erro: "Falha ao realizar upload da imagem." });
      }

      // Gerar URL pública correta
      const { data: publicURL } = supabase.storage
        .from(BUCKET_ONIBUS)
        .getPublicUrl(nomeArquivo);

      fotoURL = publicURL.publicUrl;
    }

    // Salvar dados no Firestore
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
