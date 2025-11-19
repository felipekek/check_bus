// backend/src/routes/OnibusRoutes.js
import express from "express";
import multer from "multer";
import { cadastrarOnibus } from "../controllers/OnibusController.js";

const router = express.Router();

// 🟦 Configuração do multer (pasta temporária)
//const upload = multer({ dest: "uploads/" });

router.post("/cadastrar", cadastrarOnibus);

export default router;
