import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { auth } from "./firebase-config.js";
import { initTutorial } from "./tutorial.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    const tipoUsuario = localStorage.getItem("tipoUsuario") || "aluno";
    gerarGridMenu(tipoUsuario);
  } else {
    window.location.href = "index.html";
  }
});

function gerarGridMenu(tipoUsuario) {
  const menuGrid = document.getElementById("menuGrid");
  if (!menuGrid) return;

  menuGrid.innerHTML = ""; // Limpa o grid

  const menuItems = [
    { text: "Horários", href: "seus_horarios.html", tipo: "todos", icon: "fa-clock" },
    { text: "GPS", href: "gps.html", tipo: "todos", icon: "fa-map-marker-alt" },
    { text: "Relatórios", href: "relatorios.html", tipo: "admin", icon: "fa-chart-bar" },
    { text: "Admin", href: "admin.html", tipo: "admin", icon: "fa-user-shield" },
  ];

  menuItems.forEach(item => {
    if (item.tipo === "todos" || item.tipo === tipoUsuario) {
      const a = document.createElement("a");
      a.href = item.href;
      a.className = "grid-item";
      
      const icon = document.createElement("i");
      icon.className = `fa ${item.icon}`;
      
      const span = document.createElement("span");
      span.textContent = item.text;
      
      a.appendChild(icon);
      a.appendChild(span);
      menuGrid.appendChild(a);
    }
  });

  // Define e inicia o tutorial para a página principal
  const passosTutorial = [
    {
        element: '#menuGrid',
        title: 'Menu de Opções',
        text: 'Este é o menu principal. Use estes atalhos para navegar pelas diferentes seções do aplicativo.',
        position: 'bottom'
    },
    {
        element: '#btnPerfil',
        title: 'Acesse seu Perfil',
        text: 'Clique aqui para ver e editar suas informações de perfil, como nome e e-mail.',
        position: 'top'
    },
    {
        element: '#btnFeedback',
        title: 'Envie seu Feedback',
        text: 'Sua opinião é importante! Use este botão para nos enviar sugestões ou relatar problemas.',
        position: 'top'
    }
  ];
  initTutorial(passosTutorial, 'tutorialHomeVisto');
}