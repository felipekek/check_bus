document.querySelectorAll(".faq-question").forEach(button => {

    button.addEventListener("click", () => {

        const answer = button.nextElementSibling;

        // Alternar estado do botão (setinha)
        button.classList.toggle("active");

        // Abrir e fechar suavemente
        if (answer.classList.contains("open")) {
            answer.classList.remove("open");
        } else {
            answer.classList.add("open");
        }
    });

});
