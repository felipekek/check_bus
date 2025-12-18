// frontend/js/home.js
// =======================================================
// HOME - Check Bus
// Versão FINAL estável (Firebase + Backend)
// Sem acesso direto a horários (evita permissões)
// =======================================================

import { db, auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// =======================================================
// UI base
// =======================================================
let userId = null;
const grid = document.getElementById("menuGrid");
if (grid) grid.style.visibility = "hidden";

// =======================================================
// Tutorial (lazy load seguro)
// =======================================================
let initTutorial = null;

try {
  const tutorialModule = await import("./tutorial.js").catch(() => null);
  if (tutorialModule?.initTutorial) {
    initTutorial = tutorialModule.initTutorial;
  }
} catch {
  console.log("Tutorial não disponível");
}

// =======================================================
// AUTH
// =======================================================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  userId = user.uid;
  let mostrarTutorial = false;

  // =====================================================
  // Primeiro login (seguro, sem varrer coleção)
  // =====================================================
  try {
    const userRef = doc(db, "usuarios", userId);
    const snap = await getDoc(userRef);

    if (snap.exists() && snap.data().primeiroLogin) {
      mostrarTutorial = true;
      await setDoc(userRef, { primeiroLogin: false }, { merge: true });
    }
  } catch {
    console.warn("Não foi possível verificar primeiro login (permissão).");
  }

  const tipoUsuario = localStorage.getItem("tipoUsuario") || "aluno";
  if (grid) grid.innerHTML = "";

  // =====================================================
  // Botões
  // =====================================================
  const horarioHref =
    tipoUsuario === "admin"
      ? "adm-lista-de-horarios.html"
      : "horarios.html";

  const defaultButtons = [
    { icon: "fa-clock", text: "Horários", href: horarioHref, tipo: "todos" },
    { icon: "fa-location-dot", text: "GPS", href: "gps.html", tipo: "todos" }
  ];

  const alunoButtons = [
    { icon: "fa-bell", text: "Notificações", href: "notificacoes.html", tipo: "aluno" },
    { icon: "fa-clock-rotate-left", text: "Histórico de Embarque", href: "historico.html", tipo: "aluno" },
    { icon: "fa-circle-question", text: "FAQ", href: "faq.html", tipo: "aluno" }
  ];

  const adminButtons = [
    { icon: "fa-book-open", text: "Relatórios", href: "relatorios.html", tipo: "admin" },
    { icon: "fa-users", text: "Lista de Alunos", href: "admin.html", tipo: "admin" },
    { icon: "fa-user-plus", text: "Cadastrar Motorista", href: "cadast_motorista.html", tipo: "admin" },
    { icon: "fa-bus", text: "Cadastrar Ônibus", href: "cadastro_onibus.html", tipo: "admin" },
    { icon: "fa-id-card", text: "Vincular Cartão", href: "vincular_cartao.html", tipo: "admin" },
    { icon: "fa-sitemap", text: "Gerenciar Motoristas & Ônibus", href: "onibus_motorista.html", tipo: "admin" },
    { icon: "fa-bullhorn", text: "Avisos", href: "avisos.html", tipo: "admin" },
    { icon: "fa-star", text: "Respostas Feedback", href: "respostas_feedback.html", tipo: "admin" }
  ];

  const allButtons = [...defaultButtons, ...adminButtons, ...alunoButtons];

  allButtons.forEach(btn => {
    if (btn.tipo === "todos" || btn.tipo === tipoUsuario) {
      const div = document.createElement("div");
      div.className = "card";
      div.onclick = () => (location.href = btn.href);
      div.innerHTML = `
        <i class="fa-solid ${btn.icon} fa-2x"></i>
        <span>${btn.text}</span>
      `;
      grid.appendChild(div);
    }
  });

  // =====================================================
  // Logout
  // =====================================================
  const logoutBtn = document.createElement("div");
  logoutBtn.className = "card logout";
  logoutBtn.onclick = logout;
  logoutBtn.innerHTML = `
    <i class="fa-solid fa-right-from-bracket fa-2x"></i>
    <span>Sair</span>
  `;
  grid.appendChild(logoutBtn);

  grid.style.visibility = "visible";

  // =====================================================
  // Tutorial
  // =====================================================
  if (mostrarTutorial && initTutorial) {
    initTutorial(passosTutorial, "tutorialHomeVisto");
  }
});

// =======================================================
// LOGOUT LIMPO
// =======================================================
function logout() {
  localStorage.clear();
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
}

window.logout = logout;

// =======================================================
// Tutorial steps
// =======================================================
const passosTutorial = [
  {
    element: "#menuGrid",
    title: "Menu Principal",
    text: "Aqui você acessa as principais funções do sistema.",
    position: "bottom"
  },
  {
    element: "#btnPerfil",
    title: "Perfil",
    text: "Clique aqui para visualizar e editar seus dados.",
    position: "left"
  },
  {
    element: "#btnFeedback",
    title: "Feedback",
    text: "Envie sugestões ou relate problemas.",
    position: "left"
  }
];
