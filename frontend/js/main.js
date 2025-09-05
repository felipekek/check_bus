// frontend/js/main.js
import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value.trim();
  const loginMessage = document.getElementById("loginMessage");

  try {
    // Chama o backend para login seguro
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      // Mostra mensagem de sucesso
      loginMessage.style.color = "green";
      loginMessage.textContent = data.mensagem;

      // Salva token e tipo de usuário
      localStorage.setItem("token", data.token);
      localStorage.setItem("tipoUsuario", data.tipoUsuario);

      // ⚡ Login no Firebase no frontend
      await signInWithEmailAndPassword(auth, email, senha);

      // Redireciona para home.html
      setTimeout(() => {
        window.location.href = "home.html";
      }, 500);

    } else {
      loginMessage.style.color = "red";
      loginMessage.textContent = data.erro || "Erro ao fazer login";
    }
  } catch (err) {
    loginMessage.style.color = "red";
    loginMessage.textContent = "Erro de conexão com o servidor.";
    console.error("Erro no fetch de login:", err);
  }
});
