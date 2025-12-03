/**
 * backend/src/controllers/authController.js
 * Login/cadastro/atualização usando SDK de cliente e firebase-admin.
 */

import { auth, db } from "../config/firebase-config.js";
import admin from "../config/firebase-admin.js"; // <- IMPORTANTE

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// =======================================================
// LOGIN
// =======================================================
export const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    let tipoUsuario = "aluno";
    if (email === "staff@adm.com") tipoUsuario = "admin";

    const token = await user.getIdToken();

    res.status(200).json({
      uid: user.uid,
      email: user.email,
      token,
      tipoUsuario,
      mensagem: "Login realizado com sucesso!",
    });
  } catch (error) {
    console.error("Erro no login:", error);

    let mensagem = "Erro ao fazer login. Verifique suas credenciais.";
    switch (error.code) {
      case "auth/invalid-email": mensagem = "E-mail inválido."; break;
      case "auth/user-not-found": mensagem = "Usuário não encontrado."; break;
      case "auth/wrong-password":
      case "auth/invalid-credential": mensagem = "Senha incorreta."; break;
      case "auth/too-many-requests": mensagem = "Muitas tentativas. Aguarde."; break;
    }

    res.status(401).json({ erro: mensagem });
  }
};


// =======================================================
// CADASTRAR USUÁRIO
// =======================================================
export const cadastrarUsuario = async (req, res) => {
  const { email, senha, nome, cpf, instituicao, curso, turno, telefone, periodo } = req.body;

  try {
    // 1) Criar conta no Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    const dados = {
      nome,
      email,
      cpf,
      instituicao,
      curso,
      turno,
      telefone,
      periodo,
      criadoEm: new Date().toISOString(),
      primeiroLogin: true
    };

    // 2) SALVAR NA COLEÇÃO "alunos" (normal)
    await setDoc(doc(db, "alunos", user.uid), dados);

    // 3) SALVAR NO CPF LOOKUP (admin IGNORA regras)
    await admin.firestore()
      .doc(`cpfLookup/${cpf}`)
      .set({
        idCartao: "", // vazio por enquanto, aluno vai registrar depois
        uid: user.uid,
        nome,
        email,
        criadoEm: new Date().toISOString()
      });

    // 4) Criar também campo para facilitar no futuro
    await admin.firestore()
      .doc(`cpfLookup/${cpf}`)
      .update({
        cpf: cpf,
      });

    res.status(201).json({
      uid: user.uid,
      email: user.email,
      mensagem: "Usuário cadastrado com sucesso!"
    });

  } catch (error) {
    console.error("Erro no cadastro:", error);

    let mensagem = "Erro ao cadastrar usuário.";
    if (error.code === "auth/email-already-in-use") mensagem = "E-mail já está em uso.";
    if (error.code === "auth/invalid-email") mensagem = "E-mail inválido.";
    if (error.code === "auth/weak-password") mensagem = "Senha fraca.";

    res.status(400).json({ erro: mensagem });
  }
};


// =======================================================
// ATUALIZAR EMAIL
// =======================================================
export const atualizarEmailUsuario = async (req, res) => {
  const { uid, novoEmail, senhaAtual } = req.body;

  try {
    const user = auth.currentUser;
    if (!user) return res.status(401).json({ erro: "Usuário não autenticado." });

    const cred = EmailAuthProvider.credential(user.email, senhaAtual);
    await reauthenticateWithCredential(user, cred);

    await updateEmail(user, novoEmail);

    // atualizar na coleção principal
    await updateDoc(doc(db, "alunos", uid), {
      email: novoEmail,
      atualizadoEm: new Date().toISOString(),
    });

    // atualizar também no CPF LOOKUP
    const snap = await getDoc(doc(db, "alunos", uid));
    if (snap.exists()) {
      const cpf = snap.data().cpf;

      await admin.firestore()
        .doc(`cpfLookup/${cpf}`)
        .update({
          email: novoEmail,
          atualizadoEm: new Date().toISOString()
        });
    }

    res.status(200).json({
      mensagem: "E-mail atualizado com sucesso!",
      novoEmail
    });

  } catch (error) {
    console.error("Erro ao atualizar e-mail:", error);

    let msg = "Erro ao atualizar e-mail.";
    if (error.code === "auth/invalid-email") msg = "E-mail inválido.";
    if (error.code === "auth/email-already-in-use") msg = "E-mail já usado.";
    if (error.code === "auth/wrong-password") msg = "Senha incorreta.";

    res.status(400).json({ erro: msg });
  }
};


// =======================================================
// BUSCAR USUÁRIO
// =======================================================
export const getUsuario = async (req, res) => {
  const uid = req.params.uid;
  try {
    const userDoc = await getDoc(doc(db, "alunos", uid));
    if (!userDoc.exists()) return res.status(404).json({ erro: "Usuário não encontrado!" });

    res.status(200).json(userDoc.data());

  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
};


// =======================================================
// BUSCAR ADMIN/STUFF
// =======================================================
export const getStaffUsuario = async (req, res) => {
  const uid = req.params.uid;

  try {
    const snap = await admin.firestore().doc(`staff/${uid}`).get();
    if (!snap.exists()) return res.status(404).json({ erro: "Administrador não encontrado!" });

    res.status(200).json({
      uid,
      email: snap.data().email
    });

  } catch (error) {
    console.error("Erro ao buscar staff:", error);
    res.status(500).json({ erro: "Erro interno ao buscar administrador." });
  }
};
