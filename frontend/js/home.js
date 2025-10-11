// frontend/js/home.js
import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let userId = null;
const grid = document.getElementById("menuGrid");
grid.style.visibility = "hidden"; // Esconde grid enquanto carrega

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  userId = user.uid;

  // Pega tipoUsuario do login (aluno ou admin)
  const tipoUsuario = localStorage.getItem("tipoUsuario") || "aluno";

  grid.innerHTML = ""; // Limpa o grid

  // Botões padrão para todos
  const defaultButtons = [
    { icon: 'fa-clock', text: 'Horários', href: 'horarios.html', tipo: 'todos' },
    { icon: 'fa-location-dot', text: 'GPS', href: 'gps.html', tipo: 'todos' },
    { icon: 'fa-calendar-days', text: 'Seus Horários', href: 'seus_horarios.html', tipo: 'aluno' }
  ];

  // Botões admin
  const adminButtons = [
    { icon: 'fa-book-open', text: 'Relatórios', href: 'relatorios.html', tipo: 'admin' },
    { icon: 'fa-users', text: 'Lista de Alunos', href: 'admin.html', tipo: 'admin' }
  ];

  const allButtons = [...defaultButtons, ...adminButtons];

  allButtons.forEach(btn => {
    if (btn.tipo === 'todos' || btn.tipo === tipoUsuario) {
      const div = document.createElement("div");
      div.className = "card";
      div.addEventListener("click", () => location.href = btn.href);
      div.innerHTML = `<i class="fa-solid ${btn.icon} fa-2x"></i><span>${btn.text}</span>`;
      grid.appendChild(div);
    }
  });

  // Botão logout
  const logoutBtn = document.createElement("div");
  logoutBtn.className = "card logout";
  logoutBtn.addEventListener("click", logout);
  logoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket fa-2x"></i><span>Sair</span>`;
  grid.appendChild(logoutBtn);

  grid.style.visibility = "visible";

  carregarHorarios();
});

// Carrega horários do usuário
async function carregarHorarios() {
  if (!userId) return;

  try {
    const horariosRef = collection(db, "horarios", userId, "listaHorarios");
    const horariosSnap = await getDocs(horariosRef);
    const horariosLista = document.getElementById("horariosLista");
    if (!horariosLista) return;

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
    if (horariosLista) horariosLista.innerHTML = "<p>Erro ao carregar horários.</p>";
    console.error(err);
  }
}

// Excluir horário
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
  signOut(auth).then(() => window.location.href = "index.html");
};