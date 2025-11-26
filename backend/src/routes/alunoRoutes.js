import express from "express";
import { vincularCartaoAluno } from "../controllers/alunoController.js";

const router = express.Router();

router.post("/vincular-cartao", vincularCartaoAluno);

export default router;
