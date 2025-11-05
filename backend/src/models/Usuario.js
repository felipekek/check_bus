import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  senha: {
    type: String,
    required: true,
  },
  tipoUsuario: {
    type: String,
    enum: ["motorista", "passageiro", "admin"],
    required: true,
  },
  criadoEm: {
    type: Date,
    default: Date.now,
  },
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
