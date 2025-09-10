// esqueceu_senha.js
// Página de recuperação de senha via Firebase Authentication
// Envia um link de redefinição para o e-mail informado pelo usuário.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ===============================
// Configuração do Firebase
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyDAG_nfsNFNk6ZnhTnC9Cci-N6L3Bui4PY",
  authDomain: "trancaeletronica-90835.firebaseapp.com",
  projectId: "trancaeletronica-90835",
  storageBucket: "trancaeletronica-90835.appspot.com",
  messagingSenderId: "566150115221",
  appId: "1:566150115221:web:1c6eaf30767894dbfd909c"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ===============================
// Lógica da página de recuperação
// ===============================
const form = document.getElementById("resetForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");

/**
 * Envia um e-mail de redefinição de senha
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita recarregar a página

  const email = emailInput.value;

  // Mensagem de carregamento
  message.style.color = "#555";
  message.textContent = "⏳ Enviando link de redefinição...";

  try {
    await sendPasswordResetEmail(auth, email);
    message.style.color = "green";
    message.textContent = "✅ Um link de redefinição foi enviado para seu e-mail.";
    emailInput.classList.remove("campo-invalido");
    emailInput.classList.add("campo-valido");
  } catch (error) {
    console.error("Erro ao enviar link de redefinição:", error);
    message.style.color = "red";

    // Tratamento de erros mais amigável
    switch (error.code) {
      case "auth/user-not-found":
        message.textContent = "❌ Nenhuma conta encontrada com este e-mail.";
        break;
      case "auth/invalid-email":
        message.textContent = "❌ O e-mail informado é inválido.";
        break;
      default:
        message.textContent = "❌ Erro ao enviar o link. Tente novamente.";
        break;
    }

    emailInput.classList.add("campo-invalido");
    emailInput.classList.remove("campo-valido");
  }
});
