export function initFeedbackModal() {
  const btnFeedback = document.getElementById("btnFeedback"); // botão que abre modal
  const modalFeedback = document.getElementById("modalFeedback"); // modal
  const closeFeedback = document.getElementById("closeFeedback"); // botão X
  const sendFeedback = document.getElementById("sendFeedback"); // botão "Enviar"
  const feedbackText = document.getElementById("feedbackText"); // textarea

  // Abrir modal
  btnFeedback.addEventListener("click", () => {
    modalFeedback.style.display = "flex";
  });

  // Fechar modal no X
  closeFeedback.addEventListener("click", () => {
    modalFeedback.style.display = "none";
  });

  // Fechar clicando fora da caixa
  window.addEventListener("click", (e) => {
    if (e.target === modalFeedback) {
      modalFeedback.style.display = "none";
    }
  });

  // **Botão Enviar da própria caixa de comentário**
  sendFeedback.addEventListener("click", () => {
    const feedback = feedbackText.value.trim();

    if (feedback === "") {
      alert("Escreva algum comentário antes de enviar!");
      return;
    }

    console.log("Feedback enviado:", feedback); // aqui você pode enviar para o servidor
    feedbackText.value = ""; // limpa textarea
    modalFeedback.style.display = "none"; // fecha modal
    alert("Obrigado pelo seu feedback!");
  });
}
