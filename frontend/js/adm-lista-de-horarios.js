const LS_ADMIN = 'cb_admin_state';
const LS_TURNOS = 'cb_admin_turnos';

function ymKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
function dateKey(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function load(obj) {
  try { return JSON.parse(localStorage.getItem(obj)) || {}; }
  catch { return {}; }
}
function save(obj, val) { localStorage.setItem(obj, JSON.stringify(val)); }

let currentDate = new Date();
let adminState = load(LS_ADMIN);
let turnos = (function () {
  try {
    return JSON.parse(localStorage.getItem(LS_TURNOS)) || [
      { nome: 'Manhã', saida: '06:00', chegada: '14:00' },
      { nome: 'Tarde', saida: '11:30', chegada: '18:00' },
      { nome: 'Noite', saida: '18:00', chegada: '21:00' }
    ];
  } catch { return []; }
})();

// ===== Render calendário =====
const cal = document.getElementById('calendar');
const monthLabel = document.getElementById('monthLabel');

function renderCalendar() {
  cal.innerHTML = '';
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  monthLabel.textContent = first.toLocaleString('pt-BR', { month: 'long' }) + ' ' + y;
  const ym = ymKey(currentDate);
  if (!adminState[ym]) adminState[ym] = {};

  const dows = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  dows.forEach(d => {
    const el = document.createElement('div');
    el.textContent = d;
    el.className = 'dow';
    cal.appendChild(el);
  });

  for (let i = 0; i < first.getDay(); i++) {
    const filler = document.createElement('div');
    cal.appendChild(filler);
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(y, m, d);
    const key = dateKey(y, m + 1, d);
    const state = adminState[ym][key] || 'available';
    const el = document.createElement('div');
    el.className = `day ${state}`;
    el.textContent = d;
    el.title = `${key}`;
    el.addEventListener('click', () => {
      const cur = adminState[ym][key] || 'available';
      const next = cur === 'available' ? 'no_bus' : 'available';
      adminState[ym][key] = next;
      save(LS_ADMIN, adminState);
      renderCalendar();
    });
    cal.appendChild(el);
  }
}

document.getElementById('prev').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
document.getElementById('next').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

// ===== Ferramentas =====
document.getElementById('applyWeekday').onclick = () => {
  const wd = document.getElementById('bulkWeekday').value;
  const state = document.getElementById('bulkState').value;
  if (wd === '') return;
  
  const y = currentDate.getFullYear(), m = currentDate.getMonth();
  const last = new Date(y, m + 1, 0).getDate();
  const ym = ymKey(currentDate);
  
  if (!adminState[ym]) adminState[ym] = {};
  
  for (let d = 1; d <= last; d++) {
    const dt = new Date(y, m, d);
    if (String(dt.getDay()) === String(wd)) {
      const k = dateKey(y, m + 1, d);
      adminState[ym][k] = state; // garante que seja 'available' ou 'no_bus'
    }
  }
  
  save(LS_ADMIN, adminState);
  renderCalendar();
};

document.getElementById('applyRange').onclick = () => {
  const s = document.getElementById('rangeStart').value;
  const e = document.getElementById('rangeEnd').value;
  const state = document.getElementById('rangeState').value;
  
  if (!s || !e) {
    alert('Selecione as datas de início e fim.');
    return;
  }

  // Inverte a lógica: agora pegamos os dias que DEVEM ser alterados
  const diasParaAlterar = Array.from(document.querySelectorAll('.skip-day:checked'))
    .map(cb => parseInt(cb.value));
  
  const start = new Date(s + 'T00:00:00');
  const end = new Date(e + 'T00:00:00');

  let diasProcessados = 0;
  let diasMantidos = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const diaDaSemana = d.getDay();
    
    // Inverte a lógica: se o dia NÃO está marcado, mantém sem alteração
    if (!diasParaAlterar.includes(diaDaSemana)) {
      diasMantidos++;
      continue;
    }

    const ym = ymKey(d);
    if (!adminState[ym]) {
      adminState[ym] = {};
    }
    
    const k = dateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
    adminState[ym][k] = state;
    diasProcessados++;
  }
  
  save(LS_ADMIN, adminState);
  renderCalendar();

  alert(`Alterações aplicadas!\n\n` +
        `- ${diasProcessados} dias alterados\n` +
        `- ${diasMantidos} dias mantidos sem alteração\n` +
        `- Total: ${diasProcessados + diasMantidos} dias no intervalo`);
};

// ===== Turnos =====
const tbody = document.getElementById('turnosBody');
function renderTurnos() {
  tbody.innerHTML = '';
  turnos.forEach((t, i) => {
    const tr = document.createElement('tr');
    tr.className = 'rowcard';
    tr.innerHTML = `
      <td>${t.nome}</td>
      <td><input type="time" value="${t.saida}" data-i="${i}" data-k="saida"/></td>
      <td><input type="time" value="${t.chegada}" data-i="${i}" data-k="chegada"/></td>
      <td><button class="btn danger" data-del="${i}">Excluir</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('input[type=time]').forEach(inp => {
    inp.onchange = e => {
      const i = +e.target.dataset.i;
      const k = e.target.dataset.k;
      turnos[i][k] = e.target.value;
      save(LS_TURNOS, turnos);
    };
  });
  tbody.querySelectorAll('button[data-del]').forEach(btn => {
    btn.onclick = () => {
      const i = +btn.dataset.del;
      turnos.splice(i, 1);
      save(LS_TURNOS, turnos);
      renderTurnos();
    };
  });
}
renderTurnos();

document.getElementById('addTurno').onclick = () => {
  const nome = document.getElementById('novoTurno').value.trim();
  const saida = document.getElementById('novoSaida').value;
  const chegada = document.getElementById('novoChegada').value;
  if (!nome || !saida || !chegada) return alert('Preencha nome, saída e chegada.');
  turnos.push({ nome, saida, chegada });
  save(LS_TURNOS, turnos);
  renderTurnos();
  document.getElementById('novoTurno').value = '';
  document.getElementById('novoSaida').value = '';
  document.getElementById('novoChegada').value = '';
};

// ===== Persistência simulada =====
document.getElementById('saveMonth').onclick = () => {
  const ym = ymKey(currentDate);
  const payload = { ym, days: adminState[ym] || {}, turnos };
  console.log('POST /api/servico/mes/' + ym, payload);
  alert('Mês salvo localmente (ver console).');
};

document.getElementById('loadMonth').onclick = renderCalendar;

document.getElementById('clearMonth').onclick = () => {
  const ym = ymKey(currentDate);
  if (!confirm('Limpar configurações do mês visível?')) return;
  adminState[ym] = {};
  save(LS_ADMIN, adminState);
  renderCalendar();
};

// Carregar dados do perfil
async function carregarDadosPerfil() {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    const userData = userDoc.data();

    document.getElementById("nomeUsuario").textContent = userData?.nome || "N/A";
    document.getElementById("emailUsuario").textContent = user.email || "N/A";
    document.getElementById("idUsuario").textContent = user.uid;
    document.getElementById("cpfUsuario").textContent = userData?.cpf || "N/A";
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}

// Chamar quando abrir o modal
document.getElementById("abrirPerfilAdmin").addEventListener("click", () => {
  document.getElementById("modalPerfilAdmin").style.display = "block";
  carregarDadosPerfil();
});

// init
renderCalendar();

// Adicione estas funções após as funções existentes
function toggleTodosDias(checked) {
  document.querySelectorAll('.skip-day').forEach(cb => {
    cb.checked = checked;
    const label = cb.closest('label');
    if (label) {
      label.classList.toggle('selected', checked);
    }
  });
}

// Adicione os listeners
document.getElementById('toggleDias').addEventListener('click', (e) => {
  const anyChecked = Array.from(document.querySelectorAll('.skip-day')).some(cb => cb.checked);
  toggleTodosDias(!anyChecked);
});

// Atualizar visual quando checkbox é clicado
document.querySelectorAll('.skip-day').forEach(cb => {
  cb.addEventListener('change', (e) => {
    const label = e.target.closest('label');
    if (label) {
      label.classList.toggle('selected', e.target.checked);
    }
  });
});

// Modifique o evento do rangeStart para marcar todos os dias quando um período é selecionado
document.getElementById('rangeStart').addEventListener('change', () => {
  if (document.getElementById('rangeStart').value) {
    toggleTodosDias(true); // Marca todos os dias quando um período é selecionado
  }
});
