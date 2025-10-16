const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Bloqueia acesso se não for motorista
if (!token || tipoUsuario !== "motorista") {
  alert("Acesso negado!");
  window.location.href = "index.html";
}

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
  localStorage.clear();
  window.location.href = "index.html";
};

// ---------- MAPA ----------
let map = L.map("map").setView([-23.5505, -46.6333], 13); // São Paulo por padrão
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let busMarker = null;

// ---------- FUNÇÃO DE LOCALIZAÇÃO ----------
async function atualizarLocalizacao(lat, lng) {
  // Atualiza marcador no mapa
  if (busMarker) map.removeLayer(busMarker);

  busMarker = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: "../img/bus.png",
      iconSize: [40, 40],
    }),
  })
    .addTo(map)
    .bindPopup("Ônibus em movimento 🚌")
    .openPopup();

  map.setView([lat, lng], 15);

  // Envia localização ao backend
  try {
    await fetch("/motorista/localizacao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });
    console.log("Localização atualizada com sucesso!");
  } catch (err) {
    console.error("Erro ao enviar localização:", err);
  }
}

// ---------- CAPTURA LOCALIZAÇÃO ----------
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        atualizarLocalizacao(lat, lng);
      },
      (err) => {
        alert("Erro ao obter localização: " + err.message);
      }
    );
  } else {
    alert("Geolocalização não é suportada neste navegador.");
  }
}

// ---------- EVENTOS ----------
document.getElementById("btnLocalizar").addEventListener("click", getLocation);

// Atualiza automaticamente a cada 15 segundos
setInterval(() => {
  getLocation();
}, 15000);
