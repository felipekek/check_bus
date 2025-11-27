// backend/src/controllers/relatorioController.js

import { db } from "../config/firebase-admin.js";

/**
 * Lista todos os registros de ACESSOS (admin)
 * Junta com a coleção ALUNOS para exibir informações completas
 */
export const listarRelatorios = async (req, res) => {
  try {
    // 1. Buscar todos os acessos
    const acessosSnap = await db.collection("acessos").get();

    const lista = [];

    for (const doc of acessosSnap.docs) {
      const dados = doc.data();
      const uidCartao = dados.uid; // UID DO CARTÃO

      // =============================
      // 2. Buscar aluno pelo campo CERTO: idCartao
      // =============================
      const alunoSnap = await db
        .collection("alunos")
        .where("idCartao", "==", uidCartao)
        .limit(1)
        .get();

      let aluno = null;
      if (!alunoSnap.empty) {
        aluno = alunoSnap.docs[0].data();
      }

      // =============================
      // 3. Montar objeto final da linha da tabela
      // =============================
      lista.push({
        id: doc.id,
        idCartao: uidCartao,
        horario: dados.horario,
        data: dados.data,

        aluno: aluno ? aluno.nome : "Desconhecido",
        curso: aluno ? aluno.curso : "-",
        instituicao: aluno ? aluno.instituicao : "-",
        periodo: aluno ? aluno.periodo : "-",
        turno: aluno ? aluno.turno : "-"
      });
    }

    return res.json(lista);

  } catch (error) {
    console.error("Erro ao listar relatórios:", error);
    return res.status(500).json({ erro: "Erro ao listar relatórios." });
  }
};


/**
 * Excluir um registro da coleção ACESSOS
 */
export const excluirRelatorio = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("acessos").doc(id).delete();

    return res.json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao excluir relatório:", error);
    return res.status(500).json({ erro: "Erro ao excluir relatório." });
  }
};
