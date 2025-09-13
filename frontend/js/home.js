import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const STAFF_EMAIL = "staff@adm.com";
let userId = null;

const grid = document.getElementById("menuGrid");
grid.style.visibility = "hidden"; // Esconde grid enquanto carrega

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  userId = user.uid;

  // Mostra botões padrão imediatamente
  const defaultButtons = [
    { icon: 'fa-clock', text: 'Horários', href: 'horarios.html' },
    { icon: 'fa-location-dot', text: 'GPS', href: 'gps.html' }
  ];

  grid.innerHTML = ""; // limpa o grid

  defaultButtons.forEach(btn => {
    const div = document.createElement("div");
    div.className = "card";
    div.addEventListener("click", () => location.href = btn.href);
    div.innerHTML = `<i class="fa-solid ${btn.icon} fa-2x"></i><span>${btn.text}</span>`;
    grid.appendChild(div);
  });

  // Botões admin, se for staff
  if (user.email?.toLowerCase() === STAFF_EMAIL.toLowerCase()) {
    const adminButtons = [
      { icon: 'fa-book-open', text: 'Relatórios', href: 'relatorios.html' },
      { icon: 'fa-users', text: 'Lista de Alunos', href: 'admin.html' }
    ];

    adminButtons.forEach(btn => {
      const div = document.createElement("div");
      div.className = "card";
      div.addEventListener("click", () => location.href = btn.href);
      div.innerHTML = `<i class="fa-solid ${btn.icon} fa-2x"></i><span>${btn.text}</span>`;
      grid.appendChild(div);
    });
  }

  // Botão logout
  const logoutBtn = document.createElement("div");
  logoutBtn.className = "card logout";
  logoutBtn.addEventListener("click", logout);
  logoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket fa-2x"></i><span>Sair</span>`;
  grid.appendChild(logoutBtn);

  // Grid só aparece depois de montar tudo
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

// Toggle menu lateral (se houver)
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  if (menuBtn) menuBtn.classList.toggle("hidden");
};
