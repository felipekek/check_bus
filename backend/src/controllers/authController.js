// Controller responsável pelo login e cadastro do usuário

import { auth, db } from "../config/firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// ---------------------- LOGIN SEGURO ----------------------
export const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Determina tipo de usuário
        let tipoUsuario = "aluno"; // padrão
        if (email === "staff@adm.com") tipoUsuario = "admin";

        // Gera token do Firebase
        const token = await user.getIdToken();

        res.status(200).json({
            uid: user.uid,
            email: user.email,
            token,
            tipoUsuario,
            mensagem: "Login realizado com sucesso!"
        });
    } catch (error) {
        res.status(401).json({ erro: error.message });
    }
};

// ---------------------- CADASTRO ----------------------
export const cadastrarUsuario = async (req, res) => {
    const { email, senha, nome, cpf, instituicao, curso, turno, telefone, periodo } = req.body;

    try {
        // Cria usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Salva dados complementares no Firestore
        await setDoc(doc(db, "alunos", user.uid), {
            nome,
            email,
            cpf,
            instituicao,
            curso,
            turno,
            telefone,
            periodo,
            criadoEm: new Date().toISOString()
        });

        res.status(201).json({
            uid: user.uid,
            email: user.email,
            mensagem: "Usuário cadastrado com sucesso!"
        });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(400).json({ erro: error.message });
    }
};
