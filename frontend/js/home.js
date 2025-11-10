// frontend/js/home.js
import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, getDocs, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initTutorial } from "./tutorial.js";

let userId = null;
const grid = document.getElementById("menuGrid");
grid.style.visibility = "hidden";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  userId = user.uid;
  let mostrarTutorial = false;

  try {
    const userDoc = await getDocs(collection(db, "usuarios"));
    let usuario = null;
    userDoc.forEach(docItem => {
      if (docItem.id === userId) usuario = docItem.data();
    });
    if (usuario && usuario.primeiroLogin) {
      mostrarTutorial = true;
      await setDoc(doc(db, "usuarios", userId), { primeiroLogin: false }, { merge: true });
    }
  } catch (e) {
    console.error("Erro ao verificar primeiro login:", e);
  }

  const tipoUsuario = localStorage.getItem("tipoUsuario") || "aluno";
  grid.innerHTML = "";

  // ajusta destino de "Horários" se o usuário for admin
  const horarioHref = tipoUsuario === "admin" ? "adm-lista-de-horarios.html" : "horarios.html";

  const defaultButtons = [
    { icon: 'fa-clock', text: 'Horários', href: horarioHref, tipo: 'todos' },
    { icon: 'fa-location-dot', text: 'GPS', href: 'gps.html', tipo: 'todos' }
  ];

  const adminButtons = [
    { icon: 'fa-book-open', text: 'Relatórios', href: 'relatorios.html', tipo: 'admin' },
    { icon: 'fa-users', text: 'Lista de Alunos', href: 'admin.html', tipo: 'admin' },
    { icon: 'fa-user-plus', text: 'Cadastrar Motorista', href: 'cadast_motorista.html', tipo: 'admin' },
    { icon: 'fa-star', text: 'Respostas Feedback', href: 'respostas_feedback.html', tipo: 'admin' }
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

  const logoutBtn = document.createElement("div");
  logoutBtn.className = "card logout";
  logoutBtn.addEventListener("click", logout);
  logoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket fa-2x"></i><span>Sair</span>`;
  grid.appendChild(logoutBtn);

  grid.style.visibility = "visible";
  carregarHorarios();

  if (mostrarTutorial) {
    initTutorial(passosTutorial, "tutorialHomeVisto");
  }
});

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

window.logout = () => {
  signOut(auth).then(() => window.location.href = "index.html");
};

const passosTutorial = [
  {
    element: "#menuGrid",
    title: "Menu Principal",
    text: "Aqui você acessa as principais funções do sistema: horários, GPS, relatórios e lista de alunos (se for admin).",
    position: "bottom"
  },
  {
    element: "#btnPerfil",
    title: "Perfil",
    text: "Clique aqui para visualizar e editar seus dados de perfil.",
    position: "left"
  },
  {
    element: "#btnFeedback",
    title: "Feedback",
    text: "Envie sugestões ou relate problemas para a equipe.",
    position: "left"
  }
];

window.addEventListener("DOMContentLoaded", () => {
  initTutorial(passosTutorial, "tutorialHomeVisto");
});
