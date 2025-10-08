// Elementos
const toggle = document.getElementById("personalizadoToggle");
const campos = document.getElementById("personalizadoCampos");
const salvarBtn = document.querySelector(".salvar-btn");
const diasBtns = document.querySelectorAll(".dia-btn");
const horariosContainer = document.getElementById("horariosSalvos");

// Mostrar/esconder horário personalizado
toggle.addEventListener("change", () => {
  campos.style.display = toggle.checked ? "block" : "none";
});

// Alternar dias selecionados
diasBtns.forEach(btn => {
  btn.addEventListener("click", () => btn.classList.toggle("selecionado"));
});

// Recuperar horários do localStorage
let horarios = JSON.parse(localStorage.getItem("horarios")) || [];
renderizarHorarios();

// Salvar horário
salvarBtn.addEventListener("click", () => {
  const turnoSelecionado = document.querySelector("input[name='turno']:checked");
  const turno = toggle.checked ? "Personalizado" : turnoSelecionado?.value;
  const saida = toggle.checked ? document.getElementById("saidaPersonalizada").value : turno === "Manhã" ? "06:00" : turno === "Tarde" ? "11:30" : "18:00";
  const chegada = toggle.checked ? document.getElementById("chegadaPersonalizada").value : turno === "Manhã" ? "14:00" : turno === "Tarde" ? "18:00" : "21:00";
  const diasSelecionados = [...document.querySelectorAll(".dia-btn.selecionado")].map(btn => btn.textContent);

  if (!turno || !saida || !chegada || diasSelecionados.length === 0) {
    alert("Selecione turno, horários e pelo menos um dia.");
    return;
  }

  const novoHorario = { id: Date.now(), turno, saida, chegada, dias: diasSelecionados };
  horarios.push(novoHorario);
  localStorage.setItem("horarios", JSON.stringify(horarios));

  // Reset campos
  toggle.checked = false;
  campos.style.display = "none";
  document.getElementById("saidaPersonalizada").value = "";
  document.getElementById("chegadaPersonalizada").value = "";
  diasBtns.forEach(btn => btn.classList.remove("selecionado"));
  document.querySelectorAll("input[name='turno']").forEach(r => r.checked = false);

  renderizarHorarios();
});

// Renderizar horários salvos
function renderizarHorarios() {
  horariosContainer.innerHTML = "";
  horarios.forEach(h => {
    const div = document.createElement("div");
    div.className = "linha-horario";
    div.innerHTML = `
      <span>${h.turno}</span>
      <span>${h.saida}</span>
      <span>${h.chegada}</span>
      <span>${h.dias.join(", ")}</span>
      <button class="editar-btn">Editar</button>
      <button class="excluir-btn">Excluir</button>
    `;
    horariosContainer.appendChild(div);

    div.querySelector(".excluir-btn").addEventListener("click", () => {
      horarios = horarios.filter(x => x.id !== h.id);
      localStorage.setItem("horarios", JSON.stringify(horarios));
      renderizarHorarios();
    });

    div.querySelector(".editar-btn").addEventListener("click", () => {
      if (h.turno === "Personalizado") {
        toggle.checked = true;
        campos.style.display = "block";
        document.getElementById("saidaPersonalizada").value = h.saida;
        document.getElementById("chegadaPersonalizada").value = h.chegada;
      } else {
        toggle.checked = false;
        campos.style.display = "none";
        document.querySelectorAll("input[name='turno']").forEach(r => r.checked = r.value === h.turno);
      }
      diasBtns.forEach(btn => btn.classList.toggle("selecionado", h.dias.includes(btn.textContent)));

      // Remove o horário antigo antes de salvar
      horarios = horarios.filter(x => x.id !== h.id);
      localStorage.setItem("horarios", JSON.stringify(horarios));
      renderizarHorarios();
    });
  });
}
