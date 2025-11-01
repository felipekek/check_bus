let currentDate = new Date();
let selectedDays = [];
let selectedWeekDays = [];
let horariosSalvos = [];

const holidays = [
  '2025-01-01', '2025-04-21', '2025-05-01',
  '2025-09-07', '2025-10-12', '2025-11-02',
  '2025-11-15', '2025-12-25'
];

// DOM elements
const calendarioContainer = document.getElementById('calendar');
const monthYearElem = document.getElementById('calendar-month-year');
const salvarBtn = document.querySelector('.salvar-btn');      // botão principal
const saveCalendarBtn = document.querySelector('.save-button'); // botão abaixo do calendário
const horariosSalvosContainer = document.getElementById('horariosSalvos');
const radioTurnos = document.querySelectorAll('input[name="turno"]');
const personalizadoToggle = document.getElementById('personalizadoToggle');
const personalizadoCampos = document.getElementById('personalizadoCampos');
const saidaPersonalizadaInput = document.getElementById('saidaPersonalizada');
const chegadaPersonalizadaInput = document.getElementById('chegadaPersonalizada');
const diaBtns = document.querySelectorAll('.dia-btn');

function renderCalendar() {
  if (!calendarioContainer || !monthYearElem) return;
  calendarioContainer.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  monthYearElem.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

  // espaços para alinhamento
  for (let i = 0; i < firstDay.getDay(); i++) {
    calendarioContainer.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayElem = document.createElement('div');
    dayElem.classList.add('day');

    // bloqueia sáb/dom/feriados
    if (date.getDay() === 0 || date.getDay() === 6 || holidays.includes(dateStr)) {
      dayElem.classList.add('weekend');
    } else {
      if (selectedDays.includes(dateStr)) dayElem.classList.add('selected');
      else dayElem.classList.add('active');

      dayElem.addEventListener('click', () => toggleSelectDay(dateStr, dayElem));
    }

    dayElem.textContent = day;
    calendarioContainer.appendChild(dayElem);
  }
}

function toggleSelectDay(dateStr, elem) {
  const index = selectedDays.indexOf(dateStr);
  if (index > -1) {
    selectedDays.splice(index, 1);
    elem.classList.remove('selected');
    elem.classList.add('active');
  } else {
    selectedDays.push(dateStr);
    elem.classList.remove('active');
    elem.classList.add('selected');
  }
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

function atualizarListaHorarios() {
  if (!horariosSalvosContainer) return;
  horariosSalvosContainer.innerHTML = '';

  if (horariosSalvos.length === 0) {
    horariosSalvosContainer.innerHTML = '<p style="opacity:0.7">Nenhum horário salvo.</p>';
    return;
  }

  // exibe todos os itens salvos (inclui "Dia da Semana X" como você já estava salvando)
  horariosSalvos.forEach((h, index) => {
    const linha = document.createElement('div');
    linha.className = 'linha-horario';
    linha.innerHTML = `
      <span>${h.data}</span>
      <span>${h.turno}</span>
      <span>${h.saida}</span>
      <span>${h.chegada}</span>
      <button class="editar-btn" data-index="${index}">Editar</button>
      <button class="excluir-btn" data-index="${index}">Excluir</button>
    `;
    horariosSalvosContainer.appendChild(linha);
  });

  // ligar eventos editar/excluir
  document.querySelectorAll('.editar-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.index);
      const item = horariosSalvos[idx];
      if (!item) return;

      // load into UI for edit: se for data real, preenche seleção do calendário; se for dia da semana, marca o botão correspondente
      // para simplicidade aqui vamos só remover o item e permitir re-criar (como você tinha antes)
      horariosSalvos.splice(idx, 1);

      // se item.data for data ISO (yyyy-mm-dd), coloca em selectedDays para editar
      if (/^\d{4}-\d{2}-\d{2}$/.test(item.data)) {
        selectedDays = [item.data];
        renderCalendar();
      } else if (/^Dia da Semana (\d)/.test(item.data)) {
        const m = item.data.match(/^Dia da Semana (\d)/);
        if (m) {
          const num = Number(m[1]);
          document.querySelectorAll('.dia-btn').forEach(btn => {
            if (Number(btn.dataset.dia) === num) btn.classList.add('selecionado');
          });
        }
      }

      // preenche turnos/personalizado
      if (item.personalizado) {
        personalizadoToggle.checked = true;
        personalizadoCampos.style.display = 'block';
        saidaPersonalizadaInput.value = item.saida;
        chegadaPersonalizadaInput.value = item.chegada;
        radioTurnos.forEach(r => r.checked = false);
      } else {
        personalizadoToggle.checked = false;
        personalizadoCampos.style.display = 'none';
        saidaPersonalizadaInput.value = '';
        chegadaPersonalizadaInput.value = '';
        radioTurnos.forEach(r => r.checked = (r.value === item.turno));
      }

      atualizarListaHorarios();
    };
  });

  document.querySelectorAll('.excluir-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.index);
      if (!Number.isFinite(idx)) return;
      if (confirm('Deseja realmente excluir este horário?')) {
        horariosSalvos.splice(idx, 1);
        atualizarListaHorarios();
      }
    };
  });
}

// função central que faz o saving (chamada por ambos os botões)
function handleSave() {
  // coleta dos dias da semana selecionados
  const diasSelecionados = document.querySelectorAll('.dia-btn.selecionado');
  selectedWeekDays = Array.from(diasSelecionados).map(btn => Number(btn.dataset.dia));

  if (selectedDays.length === 0 && selectedWeekDays.length === 0) {
    alert('Selecione pelo menos um dia da semana ou um dia no calendário.');
    return;
  }

  // turno
  let turnoSelecionado = null;
  radioTurnos.forEach(r => {
    if (r.checked) turnoSelecionado = r.value;
  });

  let saida = '';
  let chegada = '';
  let personalizado = false;

  if (personalizadoToggle.checked) {
    saida = saidaPersonalizadaInput.value;
    chegada = chegadaPersonalizadaInput.value;
    personalizado = true;
    if (!saida || !chegada) {
      alert('Preencha os horários personalizados.');
      return;
    }
  } else {
    if (!turnoSelecionado) {
      alert('Selecione um turno ou use horário personalizado.');
      return;
    }
    switch (turnoSelecionado) {
      case 'Manhã': saida = '06:00'; chegada = '14:00'; break;
      case 'Tarde': saida = '11:30'; chegada = '18:00'; break;
      case 'Noite': saida = '18:00'; chegada = '21:00'; break;
    }
  }

  // adiciona os dias do calendário
  selectedDays.forEach(dataStr => {
    const existe = horariosSalvos.some(h => h.data === dataStr && h.saida === saida && h.chegada === chegada);
    if (!existe) {
      horariosSalvos.push({
        data: dataStr,
        turno: personalizado ? 'Personalizado' : turnoSelecionado,
        saida, chegada, personalizado
      });
    }
  });

  // adiciona os dias da semana (salva como referência textual)
  selectedWeekDays.forEach(diaNum => {
    const label = `Dia da Semana ${diaNum}`;
    const existe = horariosSalvos.some(h => h.data === label && h.saida === saida && h.chegada === chegada);
    if (!existe) {
      horariosSalvos.push({
        data: label,
        turno: personalizado ? 'Personalizado' : turnoSelecionado,
        saida, chegada, personalizado
      });
    }
  });

  // limpar seleções e UI
  selectedDays = [];
  selectedWeekDays = [];
  document.querySelectorAll('.dia-btn').forEach(btn => btn.classList.remove('selecionado'));
  renderCalendar();

  personalizadoToggle.checked = false;
  personalizadoCampos.style.display = 'none';
  saidaPersonalizadaInput.value = '';
  chegadaPersonalizadaInput.value = '';
  radioTurnos.forEach(r => r.checked = false);

  atualizarListaHorarios();
}

// conecta os dois botões à mesma função
if (salvarBtn) salvarBtn.addEventListener('click', handleSave);
if (saveCalendarBtn) saveCalendarBtn.addEventListener('click', handleSave);

if (personalizadoToggle) {
  personalizadoToggle.addEventListener('change', () => {
    personalizadoCampos.style.display = personalizadoToggle.checked ? 'block' : 'none';
    if (personalizadoToggle.checked) radioTurnos.forEach(r => r.checked = false);
  });
}

diaBtns.forEach(btn => {
  const dia = Number(btn.dataset.dia);
  if (dia === 0 || dia === 6) {
    btn.disabled = true;
    btn.style.opacity = 0.5;
    btn.style.cursor = 'not-allowed';
  } else {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selecionado');
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  atualizarListaHorarios();
});
