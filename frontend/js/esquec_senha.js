// esquec_senha.js
// Página de recuperação de senha via Firebase Authentication
// Envia um link de redefinição para o e-mail informado pelo usuário.

import { auth } from "./firebase-config.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ===============================
// Elementos da página
// ===============================
const form = document.getElementById("resetForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");

// ===============================
// Envio do formulário
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita recarregar a página

  const email = emailInput.value.trim();

  if (!email) {
    message.style.color = "red";
    message.textContent = "⚠️ Digite um e-mail antes de continuar.";
    return;
  }

  // Mensagem de carregamento
  message.style.color = "#555";
  message.textContent = "⏳ Enviando link de redefinição...";

  try {
    await sendPasswordResetEmail(auth, email);
    message.style.color = "green";
    message.textContent = "✅ Se houver uma conta com este e-mail, enviamos um link de redefinição. Verifique sua caixa de entrada (e também a pasta de spam).";
  } catch (error) {
    console.error("Erro ao enviar link de redefinição:", error);

    // Sempre mostra a mesma mensagem genérica
    message.style.color = "green"; 
    message.textContent = "✅ Se houver uma conta com este e-mail, enviamos um link de redefinição. Verifique sua caixa de entrada (e também a pasta de spam).";
  }
});