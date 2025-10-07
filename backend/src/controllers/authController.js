/**
 * ==========================================================
 * Controller responsável pelo login e cadastro do usuário
 * Sistema: CheckBus
 * Autor: Luís Felipe (TCC)
 * ----------------------------------------------------------
 * Este arquivo contém duas funções principais:
 * 1. loginUsuario → realiza a autenticação (login)
 * 2. cadastrarUsuario → realiza o registro de novos usuários
 * Ambas se comunicam com o Firebase Authentication e Firestore.
 * ==========================================================
 */

import { auth, db } from "../config/firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/**
 * ==========================================================
 * FUNÇÃO: loginUsuario
 * ----------------------------------------------------------
 * Objetivo:
 *  - Fazer a autenticação de um usuário com e-mail e senha.
 *  - Retornar um token de autenticação e o tipo de usuário.
 *
 * Fluxo:
 *  1. Recebe o e-mail e a senha do corpo da requisição.
 *  2. Usa o Firebase Authentication para verificar as credenciais.
 *  3. Se o login for bem-sucedido, gera um token e identifica o tipo de usuário.
 *  4. Retorna os dados do usuário autenticado.
 *  5. Caso ocorra erro, envia mensagens amigáveis ao usuário.
 * ==========================================================
 */
export const loginUsuario = async (req, res) => {
  const { email, senha } = req.body; // Recebe e-mail e senha enviados pelo frontend

  try {
    /**
     * Realiza o login no Firebase Authentication
     * - Se as credenciais estiverem corretas, o Firebase retorna um objeto com informações do usuário.
     */
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    /**
     * Determina o tipo de usuário.
     * - Por padrão, todo usuário é "aluno".
     * - Caso o e-mail seja o do administrador, define como "admin".
     */
    let tipoUsuario = "aluno"; // padrão
    if (email === "staff@adm.com") tipoUsuario = "admin";

    /**
     * Gera um token de autenticação temporário do Firebase.
     * Esse token será usado nas próximas requisições protegidas.
     */
    const token = await user.getIdToken();

    /**
     * Resposta enviada ao frontend com os dados do usuário logado.
     */
    res.status(200).json({
      uid: user.uid, // ID único do usuário no Firebase
      email: user.email,
      token, // token JWT gerado pelo Firebase
      tipoUsuario, // define se é aluno ou admin
      mensagem: "Login realizado com sucesso!",
    });
  } catch (error) {
    console.error("Erro no login:", error);

    /**
     * Caso ocorra um erro durante o login, a mensagem padrão é alterada
     * conforme o tipo de erro retornado pelo Firebase.
     */
    let mensagemAmigavel =
      "Erro ao fazer login. Verifique suas credenciais e tente novamente.";

    // Tradução dos códigos de erro do Firebase para mensagens compreensíveis
    switch (error.code) {
      case "auth/invalid-email":
        mensagemAmigavel = "O e-mail informado é inválido.";
        break;
      case "auth/user-not-found":
        mensagemAmigavel =
          "Usuário não encontrado. Verifique o e-mail digitado.";
        break;
      case "auth/wrong-password":
        mensagemAmigavel = "Senha incorreta. Tente novamente.";
        break;
      case "auth/invalid-credential":
        mensagemAmigavel = "E-mail ou senha incorretos. Tente novamente.";
        break;
      case "auth/too-many-requests":
        mensagemAmigavel =
          "Muitas tentativas de login. Tente novamente mais tarde.";
        break;
      default:
        mensagemAmigavel =
          "Erro desconhecido ao tentar fazer login. Tente novamente mais tarde.";
        break;
    }

    // Retorna o erro com a mensagem amigável
    res.status(401).json({ erro: mensagemAmigavel });
  }
};

/**
 * ==========================================================
 * FUNÇÃO: cadastrarUsuario
 * ----------------------------------------------------------
 * Objetivo:
 *  - Criar uma nova conta de usuário no Firebase Authentication.
 *  - Salvar informações adicionais (nome, CPF, curso etc) no Firestore.
 *
 * Fluxo:
 *  1. Recebe os dados do formulário de cadastro.
 *  2. Cria o usuário no Authentication com e-mail e senha.
 *  3. Armazena os dados complementares no Firestore.
 *  4. Retorna uma mensagem de sucesso.
 *  5. Caso ocorra erro, retorna mensagens personalizadas.
 * ==========================================================
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
  } = req.body; // Dados enviados pelo frontend no momento do cadastro

  try {
    /**
     * Cria o usuário no Firebase Authentication.
     * - Se o e-mail ainda não estiver em uso, o usuário é criado com sucesso.
     */
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );
    const user = userCredential.user;

    /**
     * Após criar o usuário, salva seus dados complementares no Firestore.
     * - A coleção "alunos" armazena informações como nome, CPF e curso.
     * - O documento é identificado pelo uid do usuário.
     */
    await setDoc(doc(db, "alunos", user.uid), {
      nome,
      email,
      cpf,
      instituicao,
      curso,
      turno,
      telefone,
      periodo,
      criadoEm: new Date().toISOString(), // data e hora da criação do registro
    });

    /**
     * Resposta enviada ao frontend com os dados básicos do usuário cadastrado.
     */
    res.status(201).json({
      uid: user.uid,
      email: user.email,
      mensagem: "Usuário cadastrado com sucesso!",
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);

    /**
     * Caso ocorra algum erro durante o cadastro,
     * o sistema verifica o tipo de erro e mostra uma mensagem amigável.
     */
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
        mensagemAmigavel =
          "Erro ao cadastrar. Tente novamente mais tarde.";
        break;
    }

    // Retorna a resposta com a mensagem personalizada de erro
    res.status(400).json({ erro: mensagemAmigavel });
  }
};
