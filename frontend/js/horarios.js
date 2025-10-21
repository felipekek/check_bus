let currentDate = new Date();
let selectedDays = [];
let horariosSalvos = [];

const holidays = [
  '2025-01-01', '2025-04-21', '2025-05-01',
  '2025-09-07', '2025-10-12', '2025-11-02',
  '2025-11-15', '2025-12-25'
];

// Elementos do DOM
const calendarioContainer = document.getElementById('calendar');
const monthYearElem = document.getElementById('calendar-month-year');
const salvarBtn = document.querySelector('.salvar-btn');
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

  // Espaços antes do 1º dia do mês para alinhamento
  for (let i = 0; i < firstDay.getDay(); i++) {
    const empty = document.createElement('div');
    calendarioContainer.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];

    const dayElem = document.createElement('div');
    dayElem.classList.add('day');

    // Sábado (6), Domingo (0) e feriados não são selecionáveis
    if (date.getDay() === 0 || date.getDay() === 6 || holidays.includes(dateStr)) {
      dayElem.classList.add('weekend');
    } else {
      if (selectedDays.includes(dateStr)) {
        dayElem.classList.add('selected');
      } else {
        dayElem.classList.add('active');
      }

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

  // Agrupa horários iguais para exibição organizada
  const agrupados = {};

  horariosSalvos.forEach(horario => {
    const chave = `${horario.turno}|${horario.saida}|${horario.chegada}|${horario.personalizado ? 1 : 0}`;

    if (!agrupados[chave]) {
      agrupados[chave] = {
        ...horario,
        dias: []
      };
    }
    agrupados[chave].dias.push(horario.data);
  });

  Object.values(agrupados).forEach((grupo, index) => {
    grupo.dias.sort();

    const diasFormatados = grupo.dias.map(dataStr => {
      const dateObj = new Date(dataStr);
      const diaSemana = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }); // ex: Seg
      const dataFormatada = dateObj.toLocaleDateString('pt-BR'); // ex: 21/10/2025
      return `${diaSemana} (${dataFormatada})`;
    }).join(', ');

    const linha = document.createElement('div');
    linha.className = 'linha-horario';

    linha.innerHTML = `
      <span>${diasFormatados}</span>
      <span>${grupo.turno}</span>
      <span>${grupo.saida}</span>
      <span>${grupo.chegada}</span>
      <button class="editar-btn" data-index="${index}">Editar</button>
      <button class="excluir-btn" data-index="${index}">Excluir</button>
    `;

    horariosSalvosContainer.appendChild(linha);
  });

  // Eventos editar
  document.querySelectorAll('.editar-btn').forEach((btn, i) => {
    btn.onclick = () => {
      const grupo = Object.values(agrupados)[i];
      if (!grupo) return;

      // Remove os horários deste grupo do array original
      grupo.dias.forEach(dia => {
        const idx = horariosSalvos.findIndex(h => h.data === dia && h.saida === grupo.saida && h.chegada === grupo.chegada);
        if (idx !== -1) horariosSalvos.splice(idx, 1);
      });

      selectedDays = [...grupo.dias];
      renderCalendar();

      if (grupo.personalizado) {
        personalizadoToggle.checked = true;
        personalizadoCampos.style.display = 'block';
        saidaPersonalizadaInput.value = grupo.saida;
        chegadaPersonalizadaInput.value = grupo.chegada;
        radioTurnos.forEach(r => r.checked = false);
      } else {
        personalizadoToggle.checked = false;
        personalizadoCampos.style.display = 'none';
        saidaPersonalizadaInput.value = '';
        chegadaPersonalizadaInput.value = '';
        radioTurnos.forEach(r => r.checked = (r.value === grupo.turno));
      }

      atualizarListaHorarios();
    };
  });

  // Eventos excluir
  document.querySelectorAll('.excluir-btn').forEach((btn, i) => {
    btn.onclick = () => {
      const grupo = Object.values(agrupados)[i];
      if (!grupo) return;

      if (confirm("Deseja realmente excluir este horário?")) {
        grupo.dias.forEach(dia => {
          const idx = horariosSalvos.findIndex(h => h.data === dia && h.saida === grupo.saida && h.chegada === grupo.chegada);
          if (idx !== -1) horariosSalvos.splice(idx, 1);
        });
        atualizarListaHorarios();
      }
    };
  });
}

// Evento para salvar novo horário
if (salvarBtn) {
  salvarBtn.addEventListener('click', () => {
    if (selectedDays.length === 0) {
      alert('Selecione pelo menos um dia no calendário.');
      return;
    }

    // Turno selecionado
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
      // Define saída e chegada conforme turno
      switch (turnoSelecionado) {
        case 'Manhã':
          saida = '06:00';
          chegada = '14:00';
          break;
        case 'Tarde':
          saida = '11:30';
          chegada = '18:00';
          break;
        case 'Noite':
          saida = '18:00';
          chegada = '21:00';
          break;
      }
    }

    // Adiciona os horários selecionados
    selectedDays.forEach(dataStr => {
      const existe = horariosSalvos.some(h => h.data === dataStr && h.saida === saida && h.chegada === chegada);
      if (!existe) {
        horariosSalvos.push({
          data: dataStr,
          turno: personalizado ? 'Personalizado' : turnoSelecionado,
          saida,
          chegada,
          personalizado
        });
      }
    });

    // Reset seleção e formulário
    selectedDays = [];
    renderCalendar();

    personalizadoToggle.checked = false;
    personalizadoCampos.style.display = 'none';
    saidaPersonalizadaInput.value = '';
    chegadaPersonalizadaInput.value = '';
    radioTurnos.forEach(r => r.checked = false);

    atualizarListaHorarios();
  });
}

// Toggle campos personalizado
if (personalizadoToggle) {
  personalizadoToggle.addEventListener('change', () => {
    if (personalizadoToggle.checked) {
      personalizadoCampos.style.display = 'block';
      radioTurnos.forEach(r => r.checked = false);
    } else {
      personalizadoCampos.style.display = 'none';
    }
  });
}

// Dias da semana (botões): desabilita Sábados e Domingos
diaBtns.forEach(btn => {
  const dia = Number(btn.dataset.dia);
  if (dia === 0 || dia === 6) {
    btn.disabled = true;
    btn.style.opacity = 0.5;
    btn.style.cursor = 'not-allowed';
  } else {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selecionado');
      // Pode fazer a integração depois se quiser controlar dias da semana selecionados
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  atualizarListaHorarios();
});
