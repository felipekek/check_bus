// backend/src/controllers/OnibusController.js

import { db } from "../config/firebase-admin.js";
import { supabase, BUCKET_ONIBUS } from "../config/supabase.js";
import { v4 as uuidv4 } from "uuid";

// Upload de arquivo p/ Supabase
async function uploadFoto(fileBuffer, fileName, mime) {
  const { error } = await supabase.storage
    .from(BUCKET_ONIBUS)
    .upload(fileName, fileBuffer, {
      contentType: mime,
      upsert: true,
    });

  if (error) {
    console.error("Erro Supabase:", error);
    return null;
  }

  const { data } = supabase.storage
    .from(BUCKET_ONIBUS)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// CADASTRAR
export const cadastrarOnibus = async (req, res) => {
  try {
    const { numero, placa, modelo, ano, capacidade, tipo, status, observacoes } = req.body;

    let fotoUrl = null;

    if (req.file) {
      const ext = req.file.mimetype.split("/")[1];
      const nome = `onibus_${uuidv4()}.${ext}`;
      fotoUrl = await uploadFoto(req.file.buffer, nome, req.file.mimetype);
    }

    const doc = await db.collection("onibus").add({
      numero,
      placa,
      modelo,
      ano,
      capacidade,
      tipo,
      status,
      observacoes: observacoes || "",
      fotoUrl,
      criadoEm: new Date(),
    });

    res.json({ mensagem: "Cadastrado!", id: doc.id });

  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "Erro ao cadastrar." });
  }
};

// LISTAR
export const listarOnibus = async (req, res) => {
  try {
    const snap = await db.collection("onibus").get();

    const lista = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(lista);

  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar." });
  }
};

// EDITAR
export const editarOnibus = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("onibus").doc(id).update(req.body);

    res.json({ mensagem: "Atualizado!" });

  } catch (err) {
    res.status(500).json({ erro: "Erro ao editar." });
  }
};

// EXCLUIR
export const excluirOnibus = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("onibus").doc(id).delete();

    res.json({ mensagem: "Excluído!" });

  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir." });
  }
};
