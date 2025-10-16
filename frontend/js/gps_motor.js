// --- Autenticação local ---
const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Bloqueia acesso se não for motorista
if (!token || tipoUsuario !== "motorista") {
  alert("Acesso negado!");
  window.location.href = "index.html";
}

// --- Importações Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Configuração do Firebase ---
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// --- Inicializa o Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
let map = L.map("map").setView([-23.5505, -46.6333], 13); // São Paulo
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let busMarker = null;

// ---------- FUNÇÃO DE LOCALIZAÇÃO ----------
async function atualizarLocalizacao(uid, lat, lng) {
  if (busMarker) map.removeLayer(busMarker);

  // Ícone personalizado
  const busIcon = L.icon({
    iconUrl: "../img/bus-icon.svg",
    iconSize: [40, 40],
  });

  busMarker = L.marker([lat, lng], { icon: busIcon })
    .addTo(map)
    .bindPopup("Ônibus em movimento 🚌")
    .openPopup();

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
      }
    );
  } else {
    alert("Geolocalização não suportada neste navegador.");
  }
}

// ---------- EVENTOS E AUTENTICAÇÃO ----------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Acesso negado! Faça login novamente.");
    window.location.href = "index.html";
    return;
  }

  const uid = user.uid;
  console.log("Motorista autenticado:", user.email);

  // Botão manual
  document.getElementById("btnLocalizar").addEventListener("click", () => getLocation(uid));

  // Atualização automática a cada 15 segundos
  setInterval(() => getLocation(uid), 15000);
});