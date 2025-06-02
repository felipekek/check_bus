// relatorios.js

import { db, auth } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const lista = document.getElementById('lista');

// Verifica autenticação
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(db, "acessos")); // Coleção chamada "acessos"
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const item = document.createElement('div');
      item.innerHTML = `<strong>${data.nome || "Aluno"}</strong> - ${data.data} - ${data.horario}`;
      lista.appendChild(item);
    });
  } catch (error) {
    console.error("Erro ao carregar relatórios:", error);
  }
});
