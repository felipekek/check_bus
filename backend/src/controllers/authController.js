/**
 * ==========================================================
 * Controller responsável pelo login, cadastro e atualização do usuário
 * Sistema: CheckBus
 * Autor: Luís Felipe (TCC)
 * ----------------------------------------------------------
 * Controla autenticação, cadastro e busca de dados de alunos e staff.
 * ==========================================================
 */

import { auth, db } from "../config/firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

/**
 * FUNÇÃO: loginUsuario
 * ----------------------------------------------------------
 * Autentica usuário (aluno ou admin)
 */
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

    let mensagemAmigavel = "Erro ao fazer login. Verifique suas credenciais e tente novamente.";

    switch (error.code) {
      case "auth/invalid-email":
        mensagemAmigavel = "O e-mail informado é inválido.";
        break;
      case "auth/user-not-found":
        mensagemAmigavel = "Usuário não encontrado. Verifique o e-mail digitado.";
        break;
      case "auth/wrong-password":
        mensagemAmigavel = "Senha incorreta. Tente novamente.";
        break;
      case "auth/invalid-credential":
        mensagemAmigavel = "E-mail ou senha incorretos. Tente novamente.";
        break;
      case "auth/too-many-requests":
        mensagemAmigavel = "Muitas tentativas de login. Tente novamente mais tarde.";
        break;
      default:
        mensagemAmigavel = "Erro desconhecido ao tentar fazer login. Tente novamente mais tarde.";
        break;
    }

    res.status(401).json({ erro: mensagemAmigavel });
  }
};

/**
 * FUNÇÃO: cadastrarUsuario
 * ----------------------------------------------------------
 * Cria conta e salva dados do aluno no Firestore
 */
export const cadastrarUsuario = async (req, res) => {
  const {
    email,
    senha,
    nome,
    cpf,
    instituicao,
    curso,
    turno,
    telefone,
    periodo,
  } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    await setDoc(doc(db, "alunos", user.uid), {
      nome,
      email,
      cpf,
      instituicao,
      curso,
      turno,
      telefone,
      periodo,
      criadoEm: new Date().toISOString(),
      primeiroLogin: true,
    });

    res.status(201).json({
      uid: user.uid,
      email: user.email,
      mensagem: "Usuário cadastrado com sucesso!",
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);

    let mensagemAmigavel = "Erro ao cadastrar usuário.";

    switch (error.code) {
      case "auth/email-already-in-use":
        mensagemAmigavel = "Este e-mail já está em uso.";
        break;
      case "auth/invalid-email":
        mensagemAmigavel = "O e-mail informado é inválido.";
        break;
      case "auth/weak-password":
        mensagemAmigavel = "A senha deve ter pelo menos 6 caracteres.";
        break;
      default:
        mensagemAmigavel = "Erro ao cadastrar. Tente novamente mais tarde.";
        break;
    }

    res.status(400).json({ erro: mensagemAmigavel });
  }
};

/**
 * FUNÇÃO: atualizarEmailUsuario
 * ----------------------------------------------------------
 * Atualiza o e-mail do usuário (Auth + Firestore)
 */
export const atualizarEmailUsuario = async (req, res) => {
  const { uid, novoEmail, senhaAtual } = req.body;

  try {
    // Busca usuário logado
    const user = auth.currentUser;
    if (!user) {
      return res.status(401).json({ erro: "Usuário não autenticado." });
    }

    // Reautentica para segurança
    const credential = EmailAuthProvider.credential(user.email, senhaAtual);
    await reauthenticateWithCredential(user, credential);

    // Atualiza no Firebase Authentication
    await updateEmail(user, novoEmail);

    // Atualiza também no Firestore
    await updateDoc(doc(db, "alunos", uid), {
      email: novoEmail,
      atualizadoEm: new Date().toISOString(),
    });

    res.status(200).json({
      mensagem: "E-mail atualizado com sucesso!",
      novoEmail,
    });
  } catch (error) {
    console.error("Erro ao atualizar e-mail:", error);

    let mensagemAmigavel = "Erro ao atualizar e-mail.";

    switch (error.code) {
      case "auth/invalid-email":
        mensagemAmigavel = "O novo e-mail informado é inválido.";
        break;
      case "auth/email-already-in-use":
        mensagemAmigavel = "Este e-mail já está sendo usado por outra conta.";
        break;
      case "auth/wrong-password":
        mensagemAmigavel = "Senha incorreta. Não foi possível confirmar identidade.";
        break;
      case "auth/requires-recent-login":
        mensagemAmigavel = "É necessário refazer o login para alterar o e-mail.";
        break;
    }

    res.status(400).json({ erro: mensagemAmigavel });
  }
};

/**
 * FUNÇÃO: getUsuario
 * ----------------------------------------------------------
 * Retorna dados de um aluno pelo UID
 */
export const getUsuario = async (req, res) => {
  const uid = req.params.uid;

  try {
    const userDoc = await getDoc(doc(db, "alunos", uid));
    if (!userDoc.exists()) {
      return res.status(404).json({ erro: "Usuário não encontrado!" });
    }

    const userData = userDoc.data();
    res.status(200).json(userData);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ erro: "Erro ao buscar usuário." });
  }
};

/**
 * FUNÇÃO: getStaffUsuario
 * ----------------------------------------------------------
 * Retorna dados de um administrador (staff) pelo UID
 */
export const getStaffUsuario = async (req, res) => {
  const uid = req.params.uid;

  try {
    const staffDoc = await getDoc(doc(db, "staff", uid));

    if (!staffDoc.exists()) {
      return res.status(404).json({ erro: "Administrador não encontrado!" });
    }

    const staffData = staffDoc.data();

    res.status(200).json({
      uid,
      email: staffData.email,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do staff:", error);
    res.status(500).json({ erro: "Erro interno ao buscar administrador." });
  }
};
