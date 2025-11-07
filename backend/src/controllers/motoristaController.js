// controllers/motoristaController.js
import { listarPorTipo, excluirUsuario } from "../models/Usuario.js";

/* Lista motoristas */
export async function listarMotoristas(req, res) {
  try {
    const motoristas = await listarPorTipo("motorista");
    res.json(motoristas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar motoristas" });
  }
}

/* Excluir motorista */
export async function excluirMotorista(req, res) {
  try {
    await excluirUsuario(req.params.id);
    res.json({ sucesso: true, mensagem: "Motorista excluído" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir motorista" });
  }
}