// gps.js

const script = document.createElement('script');
script.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
script.onload = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css';
  document.head.appendChild(link);

  const div = document.getElementById('map');
  const map = L.map(div).setView([-12.2569, -38.9633], 13); // coordenadas iniciais

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Marcador exemplo
  const marker = L.marker([-12.2569, -38.9633]).addTo(map);
  marker.bindPopup("Ônibus está aqui.").openPopup();
};
document.head.appendChild(script);
