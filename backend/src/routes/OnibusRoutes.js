import express from "express";
import multer from "multer";
import { cadastrarOnibus } from "../controllers/OnibusController.js";

const router = express.Router();

// 🟦 Configuração do multer (para aceitar upload de imagem)
const storage = multer.memoryStorage(); // imagem fica em buffer
const upload = multer({ storage });

router.post("/cadastrar", upload.single("foto"), cadastrarOnibus);

export default router;
