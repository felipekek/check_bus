/**
 * frontend/js/feedback.js
 * ----------------------------------------------------------
 * Script responsável por gerenciar o modal de feedback
 * e enviar os comentários do usuário autenticado ao backend.
 * Compatível com alunos e administradores (staff).
 * ----------------------------------------------------------
 */

import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

/** 
 * Aguarda o Firebase Auth estar pronto e retorna o usuário logado.
 * - Evita falhas no Vercel (auth.currentUser ainda null)
 */
function waitForUser() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user || null);
    });
  });
}

/**
 * Retorna um token sempre atualizado (FORÇA refresh).
 * - Isso evita token antigo/claims antigas ao alternar aluno ⇄ admin
 */
async function getFreshToken(user) {
  if (!user) throw new Error("Usuário não autenticado");
  return await user.getIdToken(true); // 🔥 força refresh
}

export function initFeedbackModal() {
  const btnFeedback = document.getElementById("btnFeedback");
  const modalFeedback = document.getElementById("modalFeedback");
  const closeFeedback = document.getElementById("closeFeedback");
  const sendFeedback = document.getElementById("sendFeedback");
  const feedbackText = document.getElementById("feedbackText");

  /** Segurança: se a página não tiver os elementos, não quebra nada */
  if (!btnFeedback || !modalFeedback || !closeFeedback || !sendFeedback || !feedbackText) {
    console.warn("Feedback modal: elementos não encontrados na página.");
    return;
  }

  /** Abre o modal de feedback */
  btnFeedback.addEventListener("click", () => {
    modalFeedback.style.display = "flex";
  });

  /** Fecha o modal */
  closeFeedback.addEventListener("click", () => {
    modalFeedback.style.display = "none";
  });

  /** Fecha ao clicar fora do modal */
  window.addEventListener("click", (e) => {
    if (e.target === modalFeedback) {
      modalFeedback.style.display = "none";
    }
  });

  /** Envia o feedback */
  sendFeedback.addEventListener("click", async () => {
    const comentario = feedbackText.value.trim();

    if (!comentario) {
      alert("Escreva algum comentário antes de enviar!");
      return;
    }

    sendFeedback.disabled = true;

    try {
      /** Aguarda usuário do Firebase (evita null em produção) */
      const user = await waitForUser();
      if (!user) {
        alert("Erro: usuário não autenticado. Faça login novamente.");
        window.location.href = "index.html";
        return;
      }

      /** Token sempre atualizado (evita bug ao trocar aluno/admin) */
      const token = await getFreshToken(user);

      /** Mantém compatibilidade com seu fluxo atual (localStorage) */
      let uid = localStorage.getItem("uid") || user.uid;
      let tipoUsuario = localStorage.getItem("tipoUsuario"); // "aluno" ou "admin"
      const emailLocal = localStorage.getItem("email");

      /**
       * Se localStorage estiver desatualizado (troca de conta), corrige automaticamente
       * para não ficar com UID antigo e dar erro intermitente.
       */
      if (uid !== user.uid) {
        uid = user.uid;
        localStorage.setItem("uid", user.uid);
      }

      /**
       * Se tipoUsuario não existir, tenta inferir de forma segura:
       * - staff@adm.com => admin
       * - caso contrário => aluno
       */
      if (!tipoUsuario) {
        tipoUsuario = (user.email === "staff@adm.com") ? "admin" : "aluno";
        localStorage.setItem("tipoUsuario", tipoUsuario);
      }

      let usuario = {};

      /** Busca os dados do usuário conforme o tipo */
      if (tipoUsuario === "aluno") {
        /**
         * 🔥 Agora com Authorization
         * Evita 500/403 por falta de token no backend
         */
        const resAluno = await fetch(`/auth/usuario/${uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resAluno.ok) {
          /**
           * Fallback: se o backend falhar por algum motivo, ainda enviamos o feedback
           * sem travar a UX (não “quebra” sua função).
           */
          console.warn("Falha ao buscar dados do aluno no backend. Enviando fallback do Auth.");
          usuario = {
            nome: user.displayName || "Aluno",
            cpf: "—",
            email: emailLocal || user.email || null,
          };
        } else {
          usuario = await resAluno.json();
          usuario.email = emailLocal || usuario.email || user.email || null;
          usuario.nome = usuario.nome || user.displayName || "Aluno";
          usuario.cpf = usuario.cpf || "—";
        }
      } else if (tipoUsuario === "admin") {
        /** Admin (staff) */
        usuario = {
          nome: "Administrador",
          cpf: "000.000.000-00",
          email: emailLocal || user.email || "staff@adm.com",
        };
      } else {
        alert("Tipo de usuário inválido.");
        return;
      }

      /** Envia o feedback ao servidor (AGORA COM TOKEN) */
      const response = await fetch("/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: usuario.nome,
          cpf: usuario.cpf,
          comentario,
          email: usuario.email, // email sempre enviado
        }),
      });

      /** Lê a resposta (sem quebrar caso não venha JSON) */
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        alert(data.mensagem || "Feedback enviado com sucesso!");
        feedbackText.value = "";
        modalFeedback.style.display = "none";
      } else {
        alert(data.erro || "Erro ao enviar feedback!");
      }
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      sendFeedback.disabled = false;
    }
  });
}
