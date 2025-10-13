// backend/src/controllers/pdfController.js
import { db } from "../config/firebase-admin.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Formata datas no formato DD/MM/YYYY
 */
function formatarData(dataISO) {
  if (!dataISO) return "-";
  const partes = dataISO.split("-");
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/**
 * GET /relatorios/pdf
 * Gera o PDF completo ou filtrado via query string
 */
export async function gerarPDF(req, res) {
  try {
    const {
      colunas,
      dataInicial,
      dataFinal,
      curso,
      turno,
      instituicao
    } = req.query;

    const colunasSelecionadas = colunas
      ? colunas.split(",")
      : ["aluno", "idCartao", "curso", "instituicao", "periodo", "turno", "data", "horario"];

    let query = db.collection("acessos");

    if (dataInicial && dataFinal)
      query = query
        .where("data", ">=", dataInicial)
        .where("data", "<=", dataFinal);

    const snapshot = await query.orderBy("data", "desc").get();
    if (snapshot.empty)
      return res.status(404).json({ error: "Nenhum registro encontrado" });

    const lista = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const dados = docSnap.data();

        let alunoData = {
          nome: "Desconhecido",
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

        if (curso && alunoData.curso !== curso) return null;
        if (turno && alunoData.turno !== turno) return null;
        if (instituicao && alunoData.instituicao !== instituicao) return null;

        return {
          aluno: alunoData.nome || "Desconhecido",
          idCartao: dados.idCartao || alunoData.idCartao || "-",
          curso: alunoData.curso || "-",
          instituicao: alunoData.instituicao || "-",
          periodo: alunoData.periodo || "-",
          turno: alunoData.turno || "-",
          data: formatarData(dados.data) || "-",
          horario: dados.horario || "-"
        };
      })
    );

    const registrosFiltrados = lista.filter((r) => r !== null);
    if (!registrosFiltrados.length)
      return res.status(404).json({ error: "Nenhum registro após filtro" });

    gerarPDFBase(res, registrosFiltrados, colunasSelecionadas);

  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).json({ error: "Erro ao gerar PDF" });
  }
}

/**
 * POST /relatorios/pdf-filtrado
 * Gera o PDF com base nos registros visíveis e colunas selecionadas
 */
export async function gerarPDFFiltrado(req, res) {
  try {
    const { colunas, registros } = req.body;

    if (!registros || !Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ error: "Nenhum registro fornecido" });
    }

    const colunasSelecionadas =
      colunas && colunas.length > 0
        ? colunas
        : ["aluno", "idCartao", "curso", "instituicao", "periodo", "turno", "data", "horario"];

    gerarPDFBase(res, registros, colunasSelecionadas);

  } catch (err) {
    console.error("Erro ao gerar PDF filtrado:", err);
    res.status(500).json({ error: "Erro ao gerar PDF filtrado" });
  }
}

/**
 * Função auxiliar para gerar o PDF com base nos dados e colunas
 */
function gerarPDFBase(res, registros, colunasSelecionadas) {
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

  const colunasCabecalho = colunasSelecionadas.map((c) => todasColunas[c]);
  const linhas = registros.map((r) => colunasSelecionadas.map((c) => r[c] || "-"));

  // Cabeçalho
  doc.setFontSize(14);
  doc.text("Relatório de Acessos - CheckBus", 14, 15);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 22);

  // Tabela
  autoTable(doc, {
    head: [colunasCabecalho],
    body: linhas,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [52, 73, 94], textColor: 255, halign: "center" },
    theme: "grid",
    startY: 28
  });

  // Enviar PDF
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=relatorio.pdf");
  res.send(pdfBuffer);
}
