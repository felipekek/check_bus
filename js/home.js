// home.js

import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Verifica se o usuário está logado
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// Logout
window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
