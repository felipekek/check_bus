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
    lista.innerHTML = '<div class="no-data">Carregando registros...</div>';
    const querySnapshot = await getDocs(collection(db, "acessos"));
    lista.innerHTML = ""; // Limpa a mensagem de carregando

    if (querySnapshot.empty) {
      lista.innerHTML = '<div class="no-data">Nenhum registro encontrado.</div>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const item = document.createElement('div');
      item.innerHTML = `<strong>${data.nome || "Aluno"}</strong> - ${data.data} - ${data.horario}`;
      lista.appendChild(item);
    });
  } catch (error) {
    lista.innerHTML = '<div class="no-data">Erro ao carregar relatórios.</div>';
    console.error("Erro ao carregar relatórios:", error);
  }
});
