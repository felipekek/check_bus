import express from "express";
import multer from "multer";

import {
  cadastrarOnibus,
  listarOnibus,
  editarOnibus,
  excluirOnibus
} from "../controllers/OnibusController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/cadastrar", upload.single("foto"), cadastrarOnibus);
router.get("/listar", listarOnibus);
router.put("/editar/:id", editarOnibus);
router.delete("/excluir/:id", excluirOnibus);

export default router;
