/**
 * frontend/js/feedback.js
 * ----------------------------------------------------------
 * Script responsável por gerenciar o modal de feedback
 * e enviar os comentários do usuário autenticado ao backend.
 * Compatível com alunos e administradores (staff).
 * ----------------------------------------------------------
 */

export function initFeedbackModal() {
  const btnFeedback = document.getElementById("btnFeedback");
  const modalFeedback = document.getElementById("modalFeedback");
  const closeFeedback = document.getElementById("closeFeedback");
  const sendFeedback = document.getElementById("sendFeedback");
  const feedbackText = document.getElementById("feedbackText");

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

    try {
      /** Pega os dados salvos no login */
      const uid = localStorage.getItem("uid");
      const tipoUsuario = localStorage.getItem("tipoUsuario"); // "aluno" ou "admin"
      const email = localStorage.getItem("email");

      if (!uid || !tipoUsuario) {
        alert("Erro: usuário não autenticado. Faça login novamente.");
        return;
      }

      let usuario = {};

      /** Busca os dados do usuário conforme o tipo */
      if (tipoUsuario === "aluno") {
        const resAluno = await fetch(`/auth/usuario/${uid}`);
        if (!resAluno.ok) throw new Error("Erro ao buscar dados do aluno.");
        usuario = await resAluno.json();
      } else if (tipoUsuario === "admin") {
        // Placeholder para administrador
        usuario = {
          nome: "Administrador",
          cpf: "000.000.000-00",
          email: email || "staff@adm.com",
        };
      } else {
        alert("Tipo de usuário inválido.");
        return;
      }

      /** Envia o feedback ao servidor */
      const response = await fetch("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: usuario.nome,
          cpf: usuario.cpf,
          comentario,
          email: usuario.email,
        }),
      });

      /** Lê a resposta */
      const data = await response.json();

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
    }
  });
}
