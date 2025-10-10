// backend/src/controllers/adminController.js

import { db, auth as adminAuth } from "../config/firebase-admin.js";

/**
 * Função: listarAlunos
 * Objetivo:
 *   - Buscar todos os alunos cadastrados na coleção "alunos"
 *   - Para cada aluno, buscar também os horários criados por ele
 *   - Retornar uma lista estruturada em JSON
 * 
 * Observação:
 *   Antes era feito um loop com "await" dentro de um for (sequencial, lento).
 *   Agora usamos Promise.all para rodar todas as consultas de horários em paralelo.
 */
export async function listarAlunos(req, res) {
  try {
    // 1. Buscar todos os documentos da coleção "alunos"
    const alunosSnap = await db.collection("alunos").get();
    if (alunosSnap.empty) return res.json([]);

    // 2. Para cada aluno, buscar seus horários em paralelo (Promise.all)
    const lista = await Promise.all(
      alunosSnap.docs.map(async (alunoDoc) => {
        const aluno = alunoDoc.data();
        const alunoId = alunoDoc.id;

        // 2.1 Buscar os horários do aluno (subcoleção "listaHorarios")
        const horariosSnap = await db
          .collection("horarios")
          .doc(alunoId)
          .collection("listaHorarios")
          .get();

        // 2.2 Organizar os horários em um array de strings
        const horarios = horariosSnap.docs.map((h) => {
          const d = h.data();
          // Retornando objeto para manter a estrutura que o frontend espera
          return {
            dia: d.titulo || "Dia não informado",
            horario: d.horario || "Horário não informado",
          };
        });

        // 2.3 Retornar os dados completos do aluno
        return {
          id: alunoId,
          nome: aluno.nome || "-",
          cpf: aluno.cpf || "-",
          telefone: aluno.telefone || "-",
          email: aluno.email || "-",
          curso: aluno.curso || "-",
          turno: aluno.turno || "-",
          periodo: aluno.periodo || "-",
          instituicao: aluno.instituicao || "-",
          ultimoLogin: aluno.ultimoLogin || "-",
          horarios: horarios.length > 0 ? horarios : [],
        };
      })
    );

    // 3. Enviar lista final para o frontend
    res.json(lista);
  } catch (err) {
    console.error("Erro ao listar alunos:", err);
    res.status(500).json({ error: "Erro ao listar alunos" });
  }
}

/**
 * Função: excluirAluno
 * Objetivo:
 *   - Receber o ID do aluno pela URL (params)
 *   - Apagar o documento do aluno na coleção "alunos"
 *   - Apagar também os horários relacionados ao aluno
 */
export async function excluirAluno(req, res) {
  try {
    const { id } = req.params;

    // 0. Deletar o usuário do Firebase Auth (boa prática)
    await adminAuth.deleteUser(id);

    // 1. Deletar o documento do aluno em "alunos"
    await db.collection("alunos").doc(id).delete();

    // 2. Deletar os horários do aluno (subcoleção "listaHorarios")
    const horariosSnap = await db
      .collection("horarios")
      .doc(id)
      .collection("listaHorarios")
      .get();

    const batch = db.batch();
    horariosSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.json({ message: "Aluno e seus dados foram excluídos com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir aluno:", err);
    res.status(500).json({ error: "Erro ao excluir aluno" });
  }
}
