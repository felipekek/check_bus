// frontend/js/horarios.js
// =======================================================
// Integração com backend + Firebase Auth
// =======================================================
import { auth } from "./firebase-config.js";

// Se o backend serve o frontend na mesma origem, deixe "".
// Se roda separado, use: const API_BASE = "http://localhost:3000";
const API_BASE = "";

// Helpers de auth
async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  return await user.getIdToken();
}
function getUid() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  return user.uid;
}

// =======================================================
// Estado e configuração
// =======================================================
let currentDate = new Date();

const LS_CAL = "cb_calendar_state";         // estado aluno (dias 'going' + schedule)
const LS_ADMIN = "cb_admin_state";          // oferta admin (available | no_bus)
const LS_CHOICES = "cb_student_choices_me"; // snapshot (opcional)

function load(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

let calendarState = load(LS_CAL);
let adminState = load(LS_ADMIN);
let choices = load(LS_CHOICES);

// pendências de remoção (para só apagar no Firebase ao salvar)
const pendingRemovals = {}; // { [ym]: Set<dateKey> }
function markRemoval(ym, dateKey) {
  if (!pendingRemovals[ym]) pendingRemovals[ym] = new Set();
  pendingRemovals[ym].add(dateKey);
}
function unmarkRemoval(ym, dateKey) {
  if (pendingRemovals[ym]) {
    pendingRemovals[ym].delete(dateKey);
    if (pendingRemovals[ym].size === 0) delete pendingRemovals[ym];
  }
}
function listRemovals(ym) {
  return Array.from(pendingRemovals[ym] || []);
}
function clearRemovals(ym) {
  delete pendingRemovals[ym];
}

const holidays = [
  "2025-01-01","2025-04-21","2025-05-01","2025-09-07",
  "2025-10-12","2025-11-02","2025-11-15","2025-12-25"
];

// =======================================================
// Utils
// =======================================================
function ymKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
function dateKey(y, m, d) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function isWeekend(date) { return date.getDay() === 0 || date.getDay() === 6; }
function isHoliday(date) { return holidays.includes(date.toISOString().split("T")[0]); }
function toast(msg) {
  const toastEl = document.getElementById("toast");
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1800);
}

// =======================================================
// Backend <-> Front helpers
// =======================================================
function ensureMonth(ym) {
  if (!adminState[ym]) {
    adminState[ym] = {};
    const [y, m] = ym.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    for (let d = 1; d <= last; d++) {
      const dt = new Date(y, m - 1, d);
      const k = dateKey(y, m, d);
      adminState[ym][k] = (isWeekend(dt) || isHoliday(dt)) ? "no_bus" : "available";
    }
    save(LS_ADMIN, adminState);
  }
  if (!calendarState[ym]) calendarState[ym] = {};
}

function buildDaysPayloadFromCalendar(ym) {
  const monthMap = calendarState[ym] || {};
  const out = {};
  Object.keys(monthMap).forEach((k) => {
    const v = monthMap[k];
    if (v && v.state === "going" && v.schedule) {
      out[k] = { state: "going", schedule: v.schedule };
    }
  });
  return out;
}

function mergeBackendDaysIntoLocal(ym, daysFromBackend = {}) {
  if (!calendarState[ym]) calendarState[ym] = {};
  Object.keys(calendarState[ym]).forEach((k) => {
    if (calendarState[ym][k]?.state === "going") delete calendarState[ym][k];
  });
  Object.entries(daysFromBackend).forEach(([date, val]) => {
    if (val?.state === "going" && val?.schedule) {
      calendarState[ym][date] = { state: "going", schedule: val.schedule };
    }
  });
  save(LS_CAL, calendarState);
}

async function loadAdminMonth(ym) {
  try {
    const token = await getIdToken();
    const res = await fetch(`${API_BASE}/horarios/admin/${ym}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    adminState[ym] = data.days || {};
    save(LS_ADMIN, adminState);
  } catch (e) {
    console.error("loadAdminMonth:", e);
  }
}

async function loadUserMonthFromBackend(ym) {
  try {
    const uid = getUid();
    const token = await getIdToken();
    const res = await fetch(`${API_BASE}/horarios/user/${uid}/${ym}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    mergeBackendDaysIntoLocal(ym, data.days || {});
  } catch (e) {
    console.error("loadUserMonthFromBackend:", e);
  }
}

// DELETE em lote: apaga um conjunto de datas no backend
async function backendDeleteDates(ym, dates) {
  if (!dates || dates.length === 0) return;
  const uid = getUid();
  const token = await getIdToken();

  for (const date of dates) {
    const res = await fetch(`${API_BASE}/horarios/user/${uid}/${ym}/${date}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      if (res.status === 403) {
        toast("Sem permissão para excluir este dia (verifique regras do Firestore).");
        throw new Error("Permissão negada");
      }
      throw new Error(e.erro || `Falha ao apagar a data ${date}`);
    }
  }
}

// =======================================================
// Render do calendário
// =======================================================
function renderCalendar() {
  const calendarioContainer = document.getElementById("calendar");
  const monthYearElem = document.getElementById("calendar-month-year");
  if (!calendarioContainer || !monthYearElem) return;

  calendarioContainer.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const ym = ymKey(currentDate);

  ensureMonth(ym);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  monthYearElem.textContent = `${firstDay.toLocaleString("pt-BR", { month: "long" })} ${year}`;

  const dows = ["D", "S", "T", "Q", "Q", "S", "S"];
  dows.forEach((d) => {
    const el = document.createElement("div");
    el.textContent = d;
    el.className = "dow";
    calendarioContainer.appendChild(el);
  });

  for (let i = 0; i < firstDay.getDay(); i++) {
    calendarioContainer.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dKey = dateKey(year, month + 1, day);
    const offer = adminState[ym][dKey] || "available";
    const slot = calendarState[ym][dKey];

    const dayElem = document.createElement("div");
    dayElem.classList.add("day");
    dayElem.dataset.date = dKey;
    dayElem.textContent = day;

    // ✅ VERIFICAÇÃO DE FIM DE SEMANA
    const currentDate = new Date(year, month, day);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    // ✅ APLICAR CLASSES CORRETAS
    if (offer === "no_bus" || isWeekend) {
      dayElem.classList.add("no-bus", "locked");
    } else if (slot?.state === "going") {
      dayElem.classList.add("mixed");
    } else {
      dayElem.classList.add("available");
    }

    dayElem.addEventListener("click", () => {
      // ✅ BLOQUEAR CLIQUE EM FINS DE SEMANA
      if (isWeekend) {
        toast?.("Não há ônibus aos fins de semana.");
        return;
      }

      const offerNow = adminState[ym][dKey] || "available";
      if (offerNow === "no_bus") {
        toast?.("Não há ônibus nesse dia.");
        return;
      }

      // ... resto da lógica de clique
    });

    calendarioContainer.appendChild(dayElem);
  }
}

// =======================================================
// Ações de backend auxiliares
// =======================================================
async function backendClearMonth(ym) {
  const token = await getIdToken();
  const uid = getUid();
  const res = await fetch(`${API_BASE}/horarios/user/${uid}/${ym}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.erro || "Falha ao limpar mês.");
  }
}

// =======================================================
// Lista e estatísticas (responsivo)
// =======================================================
function criarLinha(dataStr, schedule) {
  const linha = document.createElement("div");
  linha.className = "linha-horario";

  const sData = document.createElement("span"); sData.dataset.label = "Data"; sData.textContent = dataStr;
  const sTurno = document.createElement("span"); sTurno.dataset.label = "Turno"; sTurno.textContent = schedule.turno;
  const sSaida = document.createElement("span"); sSaida.dataset.label = "Saída"; sSaida.textContent = schedule.saida;
  const sChegada = document.createElement("span"); sChegada.dataset.label = "Chegada"; sChegada.textContent = schedule.chegada;

  const acoes = document.createElement("span");
  acoes.className = "acoes-container";

  const btnEditar = document.createElement("button");
  btnEditar.className = "editar-btn";
  btnEditar.textContent = "Editar";

  const btnExcluir = document.createElement("button");
  btnExcluir.className = "excluir-btn";
  btnExcluir.textContent = "Excluir";

  btnEditar.addEventListener("click", () => {
    const ym = ymKey(currentDate);
    const slot = (calendarState[ym] || {})[dataStr];
    const personalizadoToggle = document.getElementById("personalizadoToggle");
    const personalizadoCampos = document.getElementById("personalizadoCampos");
    const saidaPersonalizadaInput = document.getElementById("saidaPersonalizada");
    const chegadaPersonalizadaInput = document.getElementById("chegadaPersonalizada");
    const radioTurnos = document.querySelectorAll('input[name="turno"]');

    if (slot?.schedule) {
      if (personalizadoToggle && personalizadoCampos && saidaPersonalizadaInput && chegadaPersonalizadaInput) {
        if (slot.schedule.personalizado) {
          personalizadoToggle.checked = true;
          personalizadoCampos.style.display = "block";
          saidaPersonalizadaInput.value = slot.schedule.saida || "";
          chegadaPersonalizadaInput.value = slot.schedule.chegada || "";
          radioTurnos.forEach((r) => (r.checked = false));
        } else {
          personalizadoToggle.checked = false;
          personalizadoCampos.style.display = "none";
          saidaPersonalizadaInput.value = "";
          chegadaPersonalizadaInput.value = "";
          radioTurnos.forEach((r) => (r.checked = (r.value === slot.schedule.turno)));
        }
      }
    }
    // volta esse dia para "available" local (para você poder reescolher)
    calendarState[ym][dataStr] = { state: "available" };
    // agenda remoção no backend quando salvar
    markRemoval(ym, dataStr);

    save(LS_CAL, calendarState);
    renderCalendar();
    atualizarListaHorarios();
  });

  // ⬇ EXCLUIR: apaga local e TAMBÉM no servidor (Firestore) via backendDeleteDates
  btnExcluir.addEventListener("click", async () => {
    if (!confirm(`Deseja realmente excluir o dia ${dataStr}?`)) return;
    btnExcluir.disabled = true;
    try {
      const ym = ymKey(currentDate); // função existente que retorna "YYYY-MM"
      // chama API/backend que remove as datas (deve existir backendDeleteDates)
      await backendDeleteDates(ym, [dataStr]);

      // Atualiza estado local somente após sucesso no servidor
      if (calendarState && calendarState[ym]) {
        delete calendarState[ym][dataStr];
        if (Object.keys(calendarState[ym]).length === 0) {
          delete calendarState[ym];
        }
        save(LS_CAL, calendarState); // persiste no localStorage
      }

      // garante UI consistente
      unmarkRemoval?.(ym, dataStr); // se existir função que marca remoção
      renderCalendar?.();
      atualizarListaHorarios?.();
      toast?.("Dia excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir dia:", err);
      toast?.("Erro ao excluir o dia no servidor.");
    } finally {
      btnExcluir.disabled = false;
    }
  });

  acoes.append(btnEditar, btnExcluir);
  linha.append(sData, sTurno, sSaida, sChegada, acoes);
  return linha;
}

function atualizarListaHorarios() {
  const horariosSalvosContainer = document.getElementById("horariosSalvos");
  const statTotal = document.getElementById("statTotal");
  const statTurnos = document.getElementById("statTurnos");
  if (!horariosSalvosContainer) return;

  horariosSalvosContainer.innerHTML = "";

  const ym = ymKey(currentDate);
  const map = calendarState[ym] || {};
  const entries = Object.keys(map)
    .filter((k) => map[k].state === "going" && map[k].schedule)
    .sort();

  if (entries.length === 0) {
    horariosSalvosContainer.innerHTML = '<p style="opacity:.7">Nenhum horário salvo.</p>';
    if (statTotal) statTotal.textContent = "0";
    if (statTurnos) statTurnos.textContent = "–";
    return;
  }

  const turnosCount = {};
  entries.forEach((dataStr) => {
    const { schedule } = map[dataStr];
    turnosCount[schedule.turno] = (turnosCount[schedule.turno] || 0) + 1;
    horariosSalvosContainer.appendChild(criarLinha(dataStr, schedule));
  });

  if (statTotal) statTotal.textContent = String(entries.length);
  if (statTurnos) {
    const parts = Object.entries(turnosCount).map(([t, c]) => `${t}: ${c}`);
    statTurnos.textContent = parts.join(" · ");
  }
}

// =======================================================
// Wire-up de botões/controles (com checagens)
// =======================================================
function wireUI() {
  // Personalizado toggle
  const personalizadoToggle = document.getElementById("personalizadoToggle");
  const personalizadoCampos = document.getElementById("personalizadoCampos");
  if (personalizadoToggle && personalizadoCampos) {
    personalizadoToggle.addEventListener("change", () => {
      if (personalizadoToggle.checked) {
        personalizadoCampos.style.display = "block";
        document.querySelectorAll('input[name="turno"]').forEach((r) => (r.checked = false));
      } else {
        personalizadoCampos.style.display = "none";
      }
    });
  }

  // Chips
  const chipsWrap = document.getElementById("chips");
  const btnWeekdays = document.getElementById("btnWeekdays");
  const btnClearChips = document.getElementById("btnClearChips");
  const btnApplyChips = document.getElementById("btnApplyChips");

  chipsWrap?.querySelectorAll(".chip:not([disabled])").forEach((ch) => {
    ch.addEventListener("click", () => ch.classList.toggle("is-on"));
  });
  btnWeekdays?.addEventListener("click", () => {
    chipsWrap?.querySelectorAll(".chip").forEach((ch) => {
      if (!ch.hasAttribute("disabled")) ch.classList.toggle("is-on", ["1","2","3","4","5"].includes(ch.dataset.dia));
    });
  });
  btnClearChips?.addEventListener("click", () => {
    chipsWrap?.querySelectorAll(".chip").forEach((ch) => ch.classList.remove("is-on"));
  });
  btnApplyChips?.addEventListener("click", () => {
    const radioTurnos = document.querySelectorAll('input[name="turno"]');
    const personalizadoToggle = document.getElementById("personalizadoToggle");
    const saidaPersonalizadaInput = document.getElementById("saidaPersonalizada");
    const chegadaPersonalizadaInput = document.getElementById("chegadaPersonalizada");

    const schedule = (() => {
      let turnoSelecionado = null;
      radioTurnos.forEach((r) => { if (r.checked) turnoSelecionado = r.value; });
      if (personalizadoToggle?.checked) {
        const saida = saidaPersonalizadaInput?.value;
        const chegada = chegadaPersonalizadaInput?.value;
        if (!saida || !chegada) return null;
        return { turno: "Personalizado", saida, chegada, personalizado: true };
      } else {
        if (!turnoSelecionado) return null;
        let saida = "", chegada = "";
        if (turnoSelecionado === "Manhã") { saida = "06:00"; chegada = "14:00"; }
        if (turnoSelecionado === "Tarde") { saida = "11:30"; chegada = "18:00"; }
        if (turnoSelecionado === "Noite")  { saida = "18:00"; chegada = "21:00"; }
        return { turno: turnoSelecionado, saida, chegada, personalizado: false };
      }
    })();

    if (!schedule) { toast("Escolha um turno/horário."); return; }

    const selected = Array.from(chipsWrap?.querySelectorAll(".chip.is-on") || [])
      .map((ch) => +ch.dataset.dia);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const last = new Date(year, month + 1, 0).getDate();
    const ym = ymKey(currentDate);
    ensureMonth(ym);

    for (let d = 1; d <= last; d++) {
      const dt = new Date(year, month, d);
      const k = dateKey(year, month + 1, d);
      if (selected.includes(dt.getDay()) && (adminState[ym][k] || "available") === "available") {
        calendarState[ym][k] = { state: "going", schedule: { ...schedule } };
        // se tinha remoção pendente para essa data, tirar
        unmarkRemoval(ym, k);
      }
    }

    save(LS_CAL, calendarState);
    atualizarListaHorarios();
    renderCalendar();
    toast("Aplicado ao mês atual.");
  });

  // Navegação mês
  const btnPrev = document.getElementById("prev");
  const btnNext = document.getElementById("next");
  btnPrev?.addEventListener("click", async () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    const ym = ymKey(currentDate);
    await loadAdminMonth(ym);
    await loadUserMonthFromBackend(ym);
    renderCalendar();
    atualizarListaHorarios();
  });
  btnNext?.addEventListener("click", async () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    const ym = ymKey(currentDate);
    await loadAdminMonth(ym);
    await loadUserMonthFromBackend(ym);
    renderCalendar();
    atualizarListaHorarios();
  });

  // Toolbar: Limpar, Copiar, Salvar
  const btnClear = document.getElementById("btnClear");
  const btnCopyPrev = document.getElementById("btnCopyPrev");
  const btnSave = document.getElementById("btnSave");

  btnClear?.addEventListener("click", async () => {
    const ym = ymKey(currentDate);
    try {
      await backendClearMonth(ym);
      delete calendarState[ym];
      save(LS_CAL, calendarState);
      delete choices[ym];
      save(LS_CHOICES, choices);
      clearRemovals(ym);
      atualizarListaHorarios();
      renderCalendar();
      toast("Mês limpo com sucesso!");
    } catch (e) {
      console.error(e);
      toast("Erro ao limpar mês.");
    }
  });

  btnCopyPrev?.addEventListener("click", async () => {
    try {
      const toYm = ymKey(currentDate);
      const prevDate = new Date(currentDate);
      prevDate.setMonth(prevDate.getMonth() - 1);
      const fromYm = ymKey(prevDate);
      const uid = getUid();
      const token = await getIdToken();
      const res = await fetch(`${API_BASE}/horarios/user/copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid, fromYm, toYm })
      });
      if (!res.ok) throw new Error("Falha na cópia no servidor.");
      await loadUserMonthFromBackend(toYm);
      renderCalendar();
      atualizarListaHorarios();
      toast("Copiado do mês anterior.");
    } catch (e) {
      console.error(e);
      toast("Não foi possível copiar do mês anterior.");
    }
  });

  // SALVAR: 1º apaga as datas pendentes; 2º salva os 'going' atuais
  btnSave?.addEventListener("click", async () => {
    try {
      const ym = ymKey(currentDate);
      const uid = getUid();
      const token = await getIdToken();

      // 1) apagar datas pendentes
      const removals = listRemovals(ym);
      if (removals.length) {
        await backendDeleteDates(ym, removals);
        clearRemovals(ym);
      }

      // 2) salvar dias 'going' do mês
      const days = buildDaysPayloadFromCalendar(ym);
      const res = await fetch(`${API_BASE}/horarios/user/${uid}/${ym}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast("Escolhas salvas no servidor!");
    } catch (e) {
      console.error(e);
      toast("Falha ao salvar no servidor.");
    }
  });
}

// =======================================================
// Init
// =======================================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await new Promise((resolve) => {
      const unsub = auth.onAuthStateChanged(() => { unsub(); resolve(); });
    });

    wireUI();

    const ym = ymKey(currentDate);
    await loadAdminMonth(ym);
    await loadUserMonthFromBackend(ym);

    renderCalendar();
    atualizarListaHorarios();
  } catch (e) {
    console.error("Init horarios.js:", e);
    toast("Erro ao iniciar a página de horários.");
  }
});