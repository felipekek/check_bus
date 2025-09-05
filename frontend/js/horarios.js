// frontend/js/horarios.js
const STAFF_EMAIL = "staff@adm.com";
let userId = null;

// Captura usuário logado
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  userId = user.uid;

  const btnRelatorio = document.getElementById("btnRelatorio");
  const btnAlunos = document.getElementById("btnAlunos");
  if (user.email !== STAFF_EMAIL) {
    if (btnRelatorio) btnRelatorio.style.display = "none";
    if (btnAlunos) btnAlunos.style.display = "none";
  }

  carregarHorarios();
});

// Salvar horário
window.salvarHorario = async () => {
  const titulo = document.getElementById("titulo").value;
  const hora = document.getElementById("hora").value;
  const minuto = document.getElementById("minuto").value;
  const msg = document.getElementById("msg");

  if (!titulo || !hora || !minuto) {
    msg.textContent = "Preencha todos os campos.";
    return;
  }

  const horario = `${hora.padStart(2, "0")}:${minuto.padStart(2, "0")}`;

  try {
    const res = await fetch("/horarios/salvar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, titulo, horario })
    });
    const data = await res.json();
    msg.textContent = data.mensagem;
    carregarHorarios();
  } catch {
    msg.textContent = "Erro ao salvar horário.";
  }
};

// Listar horários
async function carregarHorarios() {
  try {
    const res = await fetch(`/horarios/listar/${userId}`);
    const horarios = await res.json();
    const lista = document.getElementById("listaHorarios");
    lista.innerHTML = "";
    horarios.forEach(h => {
      const li = document.createElement("li");
      li.innerHTML = `<span><strong>${h.titulo}</strong>: ${h.horario}</span>
                      <button onclick="excluirHorario('${h.id}')">Excluir</button>`;
      lista.appendChild(li);
    });
  } catch {
    document.getElementById("msg").textContent = "Erro ao carregar horários.";
  }
}

// Excluir horário
window.excluirHorario = async (id) => {
  try {
    const res = await fetch("/horarios/excluir", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, horarioId: id })
    });
    const data = await res.json();
    document.getElementById("msg").textContent = data.mensagem;
    carregarHorarios();
  } catch {
    document.getElementById("msg").textContent = "Erro ao excluir horário.";
  }
};

// Logout
window.logout = () => {
  signOut(auth).then(() => window.location.href = "index.html");
};

// Toggle menu
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};
