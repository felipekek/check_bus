/* ===========================================================
   IMPORTA FIREBASE AUTH
=========================================================== */
import { auth } from "./firebase-config.js";

/* ===========================================================
   ELEMENTOS DA PÁGINA
=========================================================== */
const selectMotorista = document.getElementById("selectMotorista");
const selectOnibus = document.getElementById("selectOnibus");
const selectTurno = document.getElementById("selectTurno");
const listaInstituicoes = document.getElementById("listaInstituicoes");
const btnSalvar = document.getElementById("btnSalvar");
const resumoLista = document.getElementById("resumoLista");

/* ======================================
   URL BASE DA API
====================================== */
const API = "http://localhost:3000";

/* ===========================================================
   FUNÇÃO PARA OBTER TOKEN DO USUÁRIO LOGADO
=========================================================== */
async function getIdToken() {
  const user = auth.currentUser;

  if (!user) {
    console.warn("Sem usuário ainda (Firebase carregando)...");
    return null;
  }

  return await user.getIdToken();
}

/* ===========================================================
   CARREGAR MOTORISTAS DO BACKEND
=========================================================== */
async function carregarMotoristas() {
  const token = await getIdToken();
  if (!token) return;

  const res = await fetch(`${API}/motoristas/listar`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const lista = await res.json();

  selectMotorista.innerHTML = `<option value="">Selecione um motorista...</option>`;

  lista.forEach((m) => {
    selectMotorista.innerHTML += `
      <option value="${m.id}">${m.nome}</option>
    `;
  });

  return lista;
}

/* ===========================================================
   CARREGAR ÔNIBUS DO BACKEND
=========================================================== */
async function carregarOnibus() {
  const token = await getIdToken();
  if (!token) return;

  const res = await fetch(`${API}/onibus/listar`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const lista = await res.json();

  selectOnibus.innerHTML = `<option value="">Selecione um ônibus...</option>`;

  lista.forEach((o) => {
    selectOnibus.innerHTML += `
      <option value="${o.id}">Ônibus ${o.numero}</option>
    `;
  });

  return lista;
}

/* ===========================================================
   INSTITUIÇÕES FIXAS
=========================================================== */
const instituicoes = [
  "UEFS",
  "FTC",
  "UNEF",
  "Anhanguera",
  "Estácio",
  "SENAI Feira",
];

instituicoes.forEach((i) => {
  listaInstituicoes.innerHTML += `
    <label>
      <input type="checkbox" value="${i}">
      ${i}
    </label>
  `;
});

/* ===========================================================
   MAPA (Leaflet)
=========================================================== */
const mapa = L.map("mapa").setView([-12.2664, -38.9663], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(mapa);

const pontosRota = [
  { nome: "UEFS", coords: [-12.2068, -38.9577] },
  { nome: "FTC", coords: [-12.248, -38.9518] },
  { nome: "UNEF", coords: [-12.2555, -38.9622] },
];

pontosRota.forEach((p) => {
  L.marker(p.coords).addTo(mapa).bindPopup(`<b>${p.nome}</b>`);
});

/* ===========================================================
   ARMAZENA DADOS EM CACHE
=========================================================== */
let motoristasCache = [];
let onibusCache = [];

/* ===========================================================
   COLETA CONFIGURAÇÃO DO FORMULÁRIO
=========================================================== */
function coletarConfiguracao() {
  const motoristaId = selectMotorista.value;
  const motoristaNome =
    motoristasCache.find((m) => m.id === motoristaId)?.nome || "";

  const onibusId = selectOnibus.value;
  const onibusNumero =
    onibusCache.find((o) => o.id === onibusId)?.numero || "";

  const turno = selectTurno.value;
  const dias = [...document.querySelectorAll(".dias-grid input:checked")].map(
    (el) => el.value
  );
  const rota = [...document.querySelectorAll(".checkbox-list input:checked")].map(
    (el) => el.value
  );

  return {
    motoristaId,
    motoristaNome,
    onibusId,
    onibusNumero,
    turno,
    dias,
    rota,
  };
}

/* ===========================================================
   ATUALIZA O RESUMO
=========================================================== */
function atualizarResumo(cfg) {
  resumoLista.innerHTML = `
    <li><strong>Motorista:</strong> ${cfg.motoristaNome || "-"}</li>
    <li><strong>Ônibus:</strong> ${cfg.onibusNumero || "-"}</li>
    <li><strong>Turno:</strong> ${cfg.turno || "-"}</li>
    <li><strong>Dias:</strong> ${cfg.dias.join(", ") || "-"}</li>
    <li><strong>Instituições:</strong> ${cfg.rota.join(" → ") || "-"}</li>
  `;
}

["change", "input"].forEach((evt) => {
  document.addEventListener(evt, () => {
    atualizarResumo(coletarConfiguracao());
  });
});

/* ===========================================================
   SALVAR CONFIGURAÇÃO
=========================================================== */
btnSalvar.addEventListener("click", async () => {
  const cfg = coletarConfiguracao();

  if (
    !cfg.motoristaId ||
    !cfg.onibusId ||
    !cfg.turno ||
    cfg.dias.length === 0 ||
    cfg.rota.length === 0
  ) {
    alert("⚠️ Preencha todos os dados!");
    return;
  }

  const token = await getIdToken();

  const res = await fetch(`${API}/configuracoesRotas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cfg),
  });

  if (!res.ok) {
    alert("❌ Erro ao salvar configuração!");
    return;
  }

  alert("✅ Configuração salva com sucesso!");
});

/* ===========================================================
   INICIALIZAÇÃO — ESPERA LOGIN PARA INICIAR
=========================================================== */
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Você precisa fazer login novamente!");
    window.location.href = "novo_login.html";
    return;
  }

  console.log("Autenticado como:", user.email);

  motoristasCache = await carregarMotoristas();
  onibusCache = await carregarOnibus();
});
