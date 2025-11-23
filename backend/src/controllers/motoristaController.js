// backend/src/controllers/motoristaController.js
import { db } from "../config/firebase-admin.js";
import { supabase, BUCKET_MOTORISTAS } from "../config/supabase.js";

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
      fotoBase64,
    } = req.body;

    if (!nome || !email || !cpf || !telefone || !cnh || !categoria || !validadeCnh || !turno || !status) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios!" });
    }

    let fotoUrl = null;

    // Se foi enviada foto Base64
    if (fotoBase64) {
      const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, "");

      const nomeArquivo = `motorista_${Date.now()}.png`;

      const { data, error } = await supabase.storage
        .from(BUCKET_MOTORISTAS)
        .upload(nomeArquivo, Buffer.from(base64Data, "base64"), {
          contentType: "image/png",
          upsert: false,
        });

      if (error) {
        console.error("Erro Supabase:", error);
        return res.status(500).json({ erro: "Erro ao fazer upload da imagem." });
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_MOTORISTAS)
        .getPublicUrl(nomeArquivo);

      fotoUrl = urlData.publicUrl;
    }

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
      fotoUrl,
      criadoEm: new Date().toISOString(),
    });

    return res.status(201).json({ mensagem: "Motorista cadastrado com sucesso!" });

  } catch (erro) {
    console.error("❌ Erro ao cadastrar motorista:", erro);
    return res.status(500).json({ erro: "Erro ao cadastrar motorista." });
  }
};

export const listarMotoristas = async (req, res) => {
  try {
    const snapshot = await db.collection("motoristas").get();
    const motoristas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json(motoristas);
  } catch (erro) {
    console.error("Erro ao listar motoristas:", erro);
    res.status(500).json({ erro: "Erro ao listar motoristas." });
  }
};

export const editarMotorista = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    await db.collection("motoristas").doc(id).update({
      ...dados,
      atualizadoEm: new Date().toISOString(),
    });

    return res.json({ mensagem: "Motorista atualizado com sucesso!" });
  } catch (erro) {
    console.error("❌ Erro ao editar motorista:", erro);
    return res.status(500).json({ erro: "Erro ao editar motorista." });
  }
};

export const excluirMotorista = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("motoristas").doc(id).delete();

    return res.json({ mensagem: "Motorista excluído com sucesso!" });
  } catch (erro) {
    console.error("❌ Erro ao excluir motorista:", erro);
    return res.status(500).json({ erro: "Erro ao excluir motorista." });
  }
};
