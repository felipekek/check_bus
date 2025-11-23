import express from "express";
import { 
  cadastrarMotorista, 
  listarMotoristas, 
  editarMotorista, 
  excluirMotorista 
} from "../controllers/motoristaController.js";

const router = express.Router();

router.post("/cadastrar", cadastrarMotorista);
router.get("/listar", listarMotoristas);

// NOVAS ROTAS
router.put("/editar/:id", editarMotorista);
router.delete("/excluir/:id", excluirMotorista);

export default router;
