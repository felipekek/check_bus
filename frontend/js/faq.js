/* ===================================================
   FAQ.JS - CheckBus
   Accordion para perguntas frequentes
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.parentElement; // .faq-item
      const isActive = item.classList.contains("active");

      // Fecha todos os itens primeiro (accordion único)
      document.querySelectorAll(".faq-item").forEach(i => {
        i.classList.remove("active");
      });

      // Se não estava ativo, abre este
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
});