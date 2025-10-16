// Lista todos os motoristas
router.get("/motoristas", autenticarAdmin, async (req, res) => {
  try {
    const motoristas = await Usuario.find({ tipoUsuario: "motorista" });
    res.json(motoristas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar motoristas" });
  }
});

// Exclui motorista
router.delete("/motoristas/:id", autenticarAdmin, async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir motorista" });
  }
});
function validarRequisitosMotorista(m) {
  const idadeOK = m.idade >= 21;
  const cnhOK = m.cnhCategoria === "D";
  const cursoOK = m.temCursoTransporteColetivo;
  const experienciaOK = m.experienciaCategoriaBC;
  const cnhRegular = !m.temRestricoesJudiciais && !m.infracoesGravesRecentes;
  const examesOK = m.aptoFisicoMental;

  return idadeOK && cnhOK && cursoOK && experienciaOK && cnhRegular && examesOK;
}
motorista.requisitosValidados = validarRequisitosMotorista(motorista);