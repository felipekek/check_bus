// backend/src/controllers/pdfController.js
import { db } from "../config/firebase-admin.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Formata datas para DD/MM/YYYY
function formatarData(dataISO) {
  if (!dataISO) return "-";
  const partes = dataISO.split("-");
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Gera PDF da lista de acessos
export async function gerarPDF(req, res) {
  try {
    // Colunas selecionadas no front
    const colunasSelecionadas = req.query.colunas
      ? req.query.colunas.split(",")
      : ["aluno","idCartao","curso","instituicao","periodo","turno","data","horario"];

    const snapshot = await db.collection("acessos").orderBy("data", "desc").get();
    if (snapshot.empty) return res.status(404).json({ error: "Nenhum registro encontrado" });

    // Monta a lista de registros
    const lista = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const dados = docSnap.data();
        let alunoData = {
          nome: "Desconhecido",
          idCartao: "-",
          curso: "-",
          instituicao: "-",
          periodo: "-",
          turno: "-",
          horario: "-"
        };

        if (dados.uid) {
          const alunoDoc = await db.collection("alunos").doc(dados.uid).get();
          if (alunoDoc.exists) alunoData = alunoDoc.data();
        }

        return {
          aluno: alunoData.nome || "Desconhecido",
          idCartao: alunoData.idCartao || dados.idCartao || "-",
          curso: alunoData.curso || "-",
          instituicao: alunoData.instituicao || "-",
          periodo: alunoData.periodo || "-",
          turno: alunoData.turno || "-",
          data: formatarData(dados.data) || "-",
          horario: dados.horario || "-"
        };
      })
    );

    const doc = new jsPDF({ orientation: "landscape" });
    const todasColunas = {
      aluno: "Aluno",
      idCartao: "ID Cartão",
      curso: "Curso",
      instituicao: "Instituição",
      periodo: "Período",
      turno: "Turno",
      data: "Data",
      horario: "Horário"
    };

    // Apenas colunas selecionadas
    const colunas = colunasSelecionadas.map(c => todasColunas[c]);
    const linhas = lista.map(r => colunasSelecionadas.map(c => r[c]));

    autoTable(doc, {
      head: [colunas],
      body: linhas,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [52, 73, 94], textColor: 255, halign: "center" },
      theme: "grid"
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=relatorios.pdf");
    res.send(pdfBuffer);

  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).json({ error: "Erro ao gerar PDF" });
  }
}
