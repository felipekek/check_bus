import Usuario from "../models/Usuario.js";

export const listarMotoristas = async (req, res) => {
  try {
    const motoristas = await Usuario.find({ tipoUsuario: "motorista" });
    res.json(motoristas);
  } catch (err) {
    console.error("Erro ao buscar motoristas:", err);
    res.status(500).json({ erro: "Erro ao buscar motoristas" });
  }
};

export const excluirMotorista = async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao excluir motorista:", err);
    res.status(500).json({ erro: "Erro ao excluir motorista" });
  }
};
