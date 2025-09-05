// frontend/js/cadastro.js
// Faz cadastro chamando o backend (Express + Firebase)

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const instituicao = document.getElementById("instituicao").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const message = document.getElementById("message");

  try {
    const response = await fetch("/auth/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cpf, instituicao, email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      message.style.color = "green";
      message.textContent = data.mensagem;

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.erro || "Erro no cadastro";
    }
  } catch (err) {
    message.style.color = "red";
    message.textContent = "Erro de conexão com o servidor.";
  }
});
