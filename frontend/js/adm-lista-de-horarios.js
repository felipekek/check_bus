// frontend/js/adm-lista-de-horarios.js
// Controle de calendário do ADMIN + integração com backend /horarios/admin/:ym

import { auth, db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const API_BASE = ""; // mesma origem do backend

// ===================== Helpers de Auth =====================
async function waitForAuth() {
  if (auth.currentUser) return;
  await new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged(() => {
      unsub();
      resolve();
    });
  });
}

async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  return await user.getIdToken();
}

// ===================== Estado local =====================
const LS_ADMIN = "cb_admin_state";
const LS_TURNOS = "cb_admin_turnos";

function ymKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
function dateKey(y, m, d) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function loadLS(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}
function saveLS(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

let currentDate = new Date();
let adminState = loadLS(LS_ADMIN);
let turnos = (function () {
  try {
    const fromLS = JSON.parse(localStorage.getItem(LS_TURNOS));
    if (Array.isArray(fromLS) && fromLS.length) return fromLS;
    return [
      { nome: "Manhã", saida: "06:00", chegada: "14:00" },
      { nome: "Tarde", saida: "11:30", chegada: "18:00" },
      { nome: "Noite", saida: "18:00", chegada: "21:00" },
    ];
  } catch {
    return [
      { nome: "Manhã", saida: "06:00", chegada: "14:00" },
      { nome: "Tarde", saida: "11:30", chegada: "18:00" },
      { nome: "Noite", saida: "18:00", chegada: "21:00" },
    ];
  }
})();

// ===================== DOM refs =====================
const cal = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");
const tbody = document.getElementById("turnosBody");

// ===================== Backend: Admin Month =====================
async function loadMonthFromBackend(ym) {
  try {
    const token = await getIdToken();
    const res = await fetch(`${API_BASE}/horarios/admin/${ym}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.warn("Falha ao carregar mês admin:", res.status);
      return;
    }
    const data = await res.json();
    adminState[ym] = data.days || {};
    saveLS(LS_ADMIN, adminState);

    if (Array.isArray(data.turnos) && data.turnos.length) {
      turnos = data.turnos;
      localStorage.setItem(LS_TURNOS, JSON.stringify(turnos));
      renderTurnos();
    }
  } catch (err) {
    console.error("loadMonthFromBackend:", err);
  }
}

async function saveMonthToBackend() {
  try {
    const ym = ymKey(currentDate);
    const days = adminState[ym] || {};
    const token = await getIdToken();

    const res = await fetch(`${API_BASE}/horarios/admin/${ym}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ days, turnos }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.erro || "Erro ao salvar mês do admin.");
    }

    alert("Mês salvo com sucesso no servidor (calendars_admin).");
  } catch (err) {
    console.error("saveMonthToBackend:", err);
    alert("Erro ao salvar mês no servidor. Veja o console para detalhes.");
  }
}

// ===================== Render calendário =====================
function renderCalendar() {
  if (!cal || !monthLabel) return;

  cal.innerHTML = "";
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const ym = ymKey(currentDate);

  if (!adminState[ym]) adminState[ym] = {};

  monthLabel.textContent =
    first.toLocaleString("pt-BR", { month: "long" }) + " " + y;

  const dows = ["D", "S", "T", "Q", "Q", "S", "S"];
  dows.forEach((d) => {
    const el = document.createElement("div");
    el.textContent = d;
    el.className = "dow";
    cal.appendChild(el);
  });

  for (let i = 0; i < first.getDay(); i++) {
    const filler = document.createElement("div");
    cal.appendChild(filler);
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(y, m, d);
    const key = dateKey(y, m + 1, d);
    const state = adminState[ym][key] || "available";

    const el = document.createElement("div");
    el.className = `day ${state}`;
    el.textContent = d;
    el.title = key;

    el.addEventListener("click", () => {
      const cur = adminState[ym][key] || "available";
      const next = cur === "available" ? "no_bus" : "available";
      adminState[ym][key] = next;
      saveLS(LS_ADMIN, adminState);
      renderCalendar();
    });

    cal.appendChild(el);
  }
}

// ===================== Ferramentas: dia da semana =====================
const applyWeekdayBtn = document.getElementById("applyWeekday");
if (applyWeekdayBtn) {
  applyWeekdayBtn.onclick = () => {
    const wd = document.getElementById("bulkWeekday").value;
    const state = document.getElementById("bulkState").value;
    if (wd === "") return;

    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    const ym = ymKey(currentDate);

    if (!adminState[ym]) adminState[ym] = {};

    for (let d = 1; d <= last; d++) {
      const dt = new Date(y, m, d);
      if (String(dt.getDay()) === String(wd)) {
        const k = dateKey(y, m + 1, d);
        adminState[ym][k] = state;
      }
    }

    saveLS(LS_ADMIN, adminState);
    renderCalendar();
  };
}

// ===================== Ferramentas: intervalo =====================
const applyRangeBtn = document.getElementById("applyRange");
if (applyRangeBtn) {
  applyRangeBtn.onclick = () => {
    const s = document.getElementById("rangeStart").value;
    const e = document.getElementById("rangeEnd").value;
    const state = document.getElementById("rangeState").value;

    if (!s || !e) {
      alert("Selecione as datas de início e fim.");
      return;
    }

    const diasParaAlterar = Array.from(
      document.querySelectorAll(".skip-day:checked")
    ).map((cb) => parseInt(cb.value));

    const start = new Date(s + "T00:00:00");
    const end = new Date(e + "T00:00:00");

    let diasProcessados = 0;
    let diasMantidos = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const diaDaSemana = d.getDay();

      if (!diasParaAlterar.includes(diaDaSemana)) {
        diasMantidos++;
        continue;
      }

      const ym = ymKey(d);
      if (!adminState[ym]) adminState[ym] = {};

      const k = dateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
      adminState[ym][k] = state;
      diasProcessados++;
    }

    saveLS(LS_ADMIN, adminState);
    renderCalendar();

    alert(
      `Alterações aplicadas!\n\n` +
        `- ${diasProcessados} dias alterados\n` +
        `- ${diasMantidos} dias mantidos sem alteração\n` +
        `- Total: ${diasProcessados + diasMantidos} dias no intervalo`
    );
  };
}

// ===================== Turnos (com backend) =====================
function renderTurnos() {
  if (!tbody) return;
  tbody.innerHTML = "";
  turnos.forEach((t, i) => {
    const tr = document.createElement("tr");
    tr.className = "rowcard";
    tr.innerHTML = `
      <td>${t.nome}</td>
      <td><input type="time" value="${t.saida}" data-i="${i}" data-k="saida"/></td>
      <td><input type="time" value="${t.chegada}" data-i="${i}" data-k="chegada"/></td>
      <td><button class="btn danger" data-del="${i}">Excluir</button></td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('input[type="time"]').forEach((inp) => {
    inp.onchange = (e) => {
      const i = +e.target.dataset.i;
      const k = e.target.dataset.k;
      turnos[i][k] = e.target.value;
      localStorage.setItem(LS_TURNOS, JSON.stringify(turnos));
    };
  });

  tbody.querySelectorAll("button[data-del]").forEach((btn) => {
    btn.onclick = () => {
      const i = +btn.dataset.del;
      turnos.splice(i, 1);
      localStorage.setItem(LS_TURNOS, JSON.stringify(turnos));
      renderTurnos();
    };
  });
}
renderTurnos();

const addTurnoBtn = document.getElementById("addTurno");
if (addTurnoBtn) {
  addTurnoBtn.onclick = () => {
    const nome = document.getElementById("novoTurno").value.trim();
    const saida = document.getElementById("novoSaida").value;
    const chegada = document.getElementById("novoChegada").value;
    if (!nome || !saida || !chegada)
      return alert("Preencha nome, saída e chegada.");
    turnos.push({ nome, saida, chegada });
    localStorage.setItem(LS_TURNOS, JSON.stringify(turnos));
    renderTurnos();
    document.getElementById("novoTurno").value = "";
    document.getElementById("novoSaida").value = "";
    document.getElementById("novoChegada").value = "";
  };
}

// ===================== Botões mês (salvar / recarregar / limpar) =====================
const saveMonthBtn = document.getElementById("saveMonth");
if (saveMonthBtn) {
  saveMonthBtn.onclick = async () => {
    await saveMonthToBackend();
  };
}

const loadMonthBtn = document.getElementById("loadMonth");
if (loadMonthBtn) {
  loadMonthBtn.onclick = async () => {
    const ym = ymKey(currentDate);
    await loadMonthFromBackend(ym);
    renderCalendar();
  };
}

const clearMonthBtn = document.getElementById("clearMonth");
if (clearMonthBtn) {
  clearMonthBtn.onclick = () => {
    const ym = ymKey(currentDate);
    if (!confirm("Limpar configurações do mês visível?")) return;
    adminState[ym] = {};
    saveLS(LS_ADMIN, adminState);
    renderCalendar();
  };
}

// ===================== Navegação de mês =====================
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

if (prevBtn) {
  prevBtn.onclick = async () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    const ym = ymKey(currentDate);
    await loadMonthFromBackend(ym);
    renderCalendar();
  };
}
if (nextBtn) {
  nextBtn.onclick = async () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    const ym = ymKey(currentDate);
    await loadMonthFromBackend(ym);
    renderCalendar();
  };
}

// ===================== Perfil (já existia, só usa imports corretos) =====================
async function carregarDadosPerfil() {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    const userData = userDoc.data();

    document.getElementById("nomeUsuario").textContent =
      userData?.nome || "N/A";
    document.getElementById("emailUsuario").textContent =
      user.email || "N/A";
    document.getElementById("idUsuario").textContent = user.uid;
    document.getElementById("cpfUsuario").textContent =
      userData?.cpf || "N/A";
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}

const btnPerfilAdmin = document.getElementById("abrirPerfilAdmin");
if (btnPerfilAdmin) {
  btnPerfilAdmin.addEventListener("click", () => {
    document.getElementById("modalPerfilAdmin").style.display = "block";
    carregarDadosPerfil();
  });
}

// ===================== Selecionar / desmarcar todos os dias =====================
function toggleTodosDias(checked) {
  document.querySelectorAll(".skip-day").forEach((cb) => {
    cb.checked = checked;
    const label = cb.closest("label");
    if (label) label.classList.toggle("selected", checked);
  });
}

const toggleDiasBtn = document.getElementById("toggleDias");
if (toggleDiasBtn) {
  toggleDiasBtn.addEventListener("click", () => {
    const anyChecked = Array.from(
      document.querySelectorAll(".skip-day")
    ).some((cb) => cb.checked);
    toggleTodosDias(!anyChecked);
  });
}

document.querySelectorAll(".skip-day").forEach((cb) => {
  cb.addEventListener("change", (e) => {
    const label = e.target.closest("label");
    if (label) label.classList.toggle("selected", e.target.checked);
  });
});

const rangeStartInput = document.getElementById("rangeStart");
if (rangeStartInput) {
  rangeStartInput.addEventListener("change", () => {
    if (rangeStartInput.value) {
      toggleTodosDias(true);
    }
  });
}

// ===================== Init =====================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await waitForAuth();
    const ym = ymKey(currentDate);
    await loadMonthFromBackend(ym); // carrega oferta de ônibus + turnos do Firestore
    renderCalendar();
  } catch (err) {
    console.error("Erro ao iniciar página de calendário admin:", err);
    renderCalendar(); // fallback com somente o que tiver no localStorage
  }
});
