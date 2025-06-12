// home.js
// Página inicial do aluno. Mostra horários cadastrados e permite excluir.

import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, getDocs, query, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const STAFF_EMAIL = "staff@adm.com";
let userId = null;

// Controle de acesso e carregamento dos horários
onAuthStateChanged(auth, async (user) => {
  const btnRelatorio = document.getElementById("btnRelatorio");
  const btnAlunos = document.getElementById("btnAlunos");

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Esconde botões de admin para usuários comuns
  if (user.email !== STAFF_EMAIL) {
    if (btnRelatorio) btnRelatorio.style.display = "none";
    if (btnAlunos) btnAlunos.style.display = "none";
  }

  userId = user.uid;
  carregarHorarios();
});

// Carrega horários do usuário logado
async function carregarHorarios() {
  if (!userId) return;

  try {
    const horariosRef = collection(db, "horarios", userId, "listaHorarios");
    const horariosSnap = await getDocs(horariosRef);
    const horariosLista = document.getElementById("horariosLista");
    horariosLista.innerHTML = "";

    if (horariosSnap.empty) {
      horariosLista.innerHTML = "<p>Você ainda não tem horários salvos.</p>";
    } else {
      horariosSnap.forEach(docItem => {
        const data = docItem.data();
        const titulo = data.titulo || "Sem título";
        const horario = data.horario || "--:--";
        const div = document.createElement("div");
        div.classList.add("horario-item");
        div.innerHTML = `
          <span><strong>${titulo}</strong>: ${horario}</span>
          <button onclick="excluirHorario('${docItem.id}')">Excluir</button>
        `;
        horariosLista.appendChild(div);
      });
    }
  } catch (err) {
    const horariosLista = document.getElementById("horariosLista");
    horariosLista.innerHTML = "<p>Erro ao carregar horários.</p>";
  }
}

// Exclui um horário do usuário
window.excluirHorario = async (docId) => {
  try {
    const horarioDocRef = doc(db, "horarios", userId, "listaHorarios", docId);
    await deleteDoc(horarioDocRef);
    carregarHorarios();
  } catch (err) {
    alert("Erro ao excluir o horário.");
    console.error(err);
  }
};

// Logout
window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// Abre/fecha o menu lateral
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};
