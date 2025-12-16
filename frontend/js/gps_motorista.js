// gps_motorista.js - CORRIGIDO
// Usando firebase-config.js centralizado

import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ---------- MENU ----------
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};

// ---------- LOGOUT ----------
window.logout = () => {
  signOut(auth).then(() => {
    localStorage.clear();
    window.location.href = "index.html";
  });
};

// ---------- MAPA ----------
let map = L.map("map").setView([-12.2576, -38.9647], 13); // Feira de Santana
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let busMarker = null;

// ---------- FUNÇÃO DE LOCALIZAÇÃO ----------
async function atualizarLocalizacao(uid, lat, lng) {
  if (busMarker) map.removeLayer(busMarker);

  // Ícone personalizado (se existir)
  const busIcon = L.icon({
    iconUrl: "../img/bus-icon.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  try {
    busMarker = L.marker([lat, lng], { icon: busIcon })
      .addTo(map)
      .bindPopup("Ônibus em movimento 🚌")
      .openPopup();
  } catch {
    // Fallback se o ícone não existir
    busMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("Ônibus em movimento 🚌")
      .openPopup();
  }

  map.setView([lat, lng], 15);

  try {
    await setDoc(doc(db, "motoristas_localizacao", uid), {
      latitude: lat,
      longitude: lng,
      atualizadoEm: serverTimestamp(),
    });
    console.log("📍 Localização salva no Firestore!");
  } catch (err) {
    console.error("Erro ao salvar localização:", err);
  }
}

// ---------- CAPTURA LOCALIZAÇÃO ----------
function getLocation(uid) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        atualizarLocalizacao(uid, lat, lng);
      },
      (err) => {
        alert("Erro ao obter localização: " + err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    alert("Geolocalização não suportada neste navegador.");
  }
}

// ---------- AUTENTICAÇÃO ----------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Acesso negado! Faça login novamente.");
    window.location.href = "index.html";
    return;
  }

  // Verificar se é motorista (validação no servidor seria melhor)
  const tipoUsuario = localStorage.getItem("tipoUsuario");
  if (tipoUsuario !== "motorista") {
    alert("Acesso restrito a motoristas!");
    window.location.href = "index.html";
    return;
  }

  const uid = user.uid;
  console.log("Motorista autenticado:", user.email);

  // Botão manual
  const btnLocalizar = document.getElementById("btnLocalizar");
  if (btnLocalizar) {
    btnLocalizar.addEventListener("click", () => getLocation(uid));
  }

  // Atualização automática a cada 15 segundos
  setInterval(() => getLocation(uid), 15000);

  // Primeira atualização
  getLocation(uid);
});
