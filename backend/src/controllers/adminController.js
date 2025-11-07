// controllers/adminController.js

export function validarRequisitosMotorista(req, res) {
  try {
    const m = req.body;

    const validado =
      m.idade >= 21 &&
      m.cnhCategoria === "D" &&
      !!m.temCursoTransporteColetivo &&
      !!m.experienciaCategoriaBC &&
      !m.temRestricoesJudiciais &&
      !m.infracoesGravesRecentes &&
      !!m.aptoFisicoMental;

    res.json({ validado });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao validar motorista" });
  }
}