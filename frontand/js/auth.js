// auth.js
// Funções de autenticação (login) usando Firebase Authentication.

import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Função de login chamada pelo formulário
window.login = async () => {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const msg = document.getElementById('msg');

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    msg.textContent = "Login realizado!";
    window.location.href = "home.html";
  } catch (error) {
    msg.textContent = "Erro: " + error.message;
  }
};

// Mantém usuário logado (opcional, só log para debug)
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuário logado:", user.email);
  }
});
