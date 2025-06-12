// gps.js
// Mostra o mapa e localização do usuário usando Leaflet e geolocalização do navegador.

import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// STAFF_EMAIL para controle de acesso
const STAFF_EMAIL = "staff@adm.com";

// Controle de acesso: esconde botões para não-staff
onAuthStateChanged(auth, async (user) => {
  const btnRelatorio = document.getElementById("btnRelatorio");
  const btnAlunos = document.getElementById("btnAlunos");

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  if (user.email !== STAFF_EMAIL) {
    if (btnRelatorio) btnRelatorio.style.display = "none";
    if (btnAlunos) btnAlunos.style.display = "none";
  }
});

// Função de logout
window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// Função para abrir/fechar o menu lateral
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};

// Inicialização do mapa Leaflet
let map = L.map("map").setView([-12.2576, -38.9647], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
let marker = L.marker([-12.2576, -38.9647]).addTo(map);

// Função para buscar a localização do usuário
window.getLocation = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        map.setView([lat, lon], 15);
        marker.setLatLng([lat, lon]);
      },
      function () {
        alert("Não foi possível obter a localização.");
      }
    );
  } else {
    alert("Geolocalização não é suportada neste navegador.");
  }
};
