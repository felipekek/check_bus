// Ativar calendário com Flatpickr
flatpickr("#calendario", {
  locale: "pt",
  dateFormat: "d/m/Y",
});

// Alternar dias selecionados
document.querySelectorAll(".dia-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("selecionado");
  });
});

// Salvar horário
function salvarHorario() {
  const titulo = document.getElementById("titulo").value.trim();
  const hora = document.getElementById("hora").value;
  const minuto = document.getElementById("minuto").value;

  const diasSelecionados = [];
  document.querySelectorAll(".dia-btn.selecionado").forEach(btn => {
    diasSelecionados.push(btn.textContent);
  });

  if (!titulo || hora === "" || minuto === "" || diasSelecionados.length === 0) {
    mostrarMensagem("Preencha todos os campos!", "red");
    return;
  }

  // Validação adicional
  const h = parseInt(hora, 10);
  const m = parseInt(minuto, 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    mostrarMensagem("Hora ou minuto inválido!", "red");
    return;
  }

  const horario = `${hora.padStart(2, "0")}:${minuto.padStart(2, "0")}`;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${diasSelecionados.join(", ")}</td>
    <td>${titulo}</td>
    <td>${horario}</td>
    <td>
      <button class="edit-btn" onclick="editarHorario(this)">Editar</button>
      <button class="delete-btn" onclick="excluirHorario(this)">Excluir</button>
    </td>
  `;
  document.getElementById("listaHorarios").appendChild(tr);

  mostrarMensagem("Horário salvo com sucesso!", "green");
  document.getElementById("formHorario").reset();
  document.querySelectorAll(".dia-btn").forEach(btn => btn.classList.remove("selecionado"));
}

// Mostrar mensagens
function mostrarMensagem(texto, cor) {
  const msg = document.getElementById("msg");
  msg.textContent = texto;
  msg.style.color = cor;
}

// Excluir horário
function excluirHorario(botao) {
  const linha = botao.closest("tr");
  linha.remove();
}

// Editar horário
function editarHorario(botao) {
  const linha = botao.closest("tr");
  const colunas = linha.querySelectorAll("td");

  const dias = colunas[0].textContent.split(", ");
  const titulo = colunas[1].textContent;
  const [hora, minuto] = colunas[2].textContent.split(":");

  document.getElementById("titulo").value = titulo;
  document.getElementById("hora").value = hora;
  document.getElementById("minuto").value = minuto;

  document.querySelectorAll(".dia-btn").forEach(btn => {
    if (dias.includes(btn.textContent)) {
      btn.classList.add("selecionado");
    } else {
      btn.classList.remove("selecionado");
    }
  });

  linha.remove();
  mostrarMensagem("Você está editando este horário.", "#ff9900");
}

// ✅ Limitar hora/minuto para 2 dígitos no input
["hora", "minuto"].forEach(id => {
  const input = document.getElementById(id);

  input.addEventListener("input", () => {
    if (input.value.length > 2) {
      input.value = input.value.slice(0, 2);
    }
  });

  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const texto = (e.clipboardData || window.clipboardData).getData("text");
    if (!/^\d{1,2}$/.test(texto)) return;
    input.value = texto.slice(0, 2);
  });
});
