// admin.js
// Página de administração: lista, exibe e exclui alunos e seus horários. Só acessível para staff.

// ---------- CONTROLE DE ACESSO ----------
const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Redireciona se não estiver logado ou não for admin
if (!token || tipoUsuario !== "admin") {
  window.location.href = "index.html";
}

let listaAlunos = []; // guarda todos os alunos carregados
let chartInstituicoes = null; // gráfico de pizza
let instituicaoSelecionada = null; // controla filtro ativo
let coresOriginais = []; // guarda cores originais

// === Helpers para destaque de busca ===
function escapeRegExp(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlight(text = "", termo = "") {
  if (!termo) return text ?? "";
  const re = new RegExp(`(${escapeRegExp(termo)})`, "gi");
  return (text ?? "").toString().replace(re, '<mark class="hl">$1</mark>');
}

// ---------- CARREGA ALUNOS ----------
async function carregarAlunos() {
  const container = document.getElementById("accordionContainer");
  container.innerHTML = `<p class="no-data">Carregando alunos...</p>`;

  try {
    const res = await fetch("/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erro ao buscar alunos");

    listaAlunos = await res.json();

    if (listaAlunos.length === 0) {
      container.innerHTML = `<p class="no-data">Nenhum aluno cadastrado.</p>`;
      atualizarGrafico([]); // limpa gráfico
      atualizarMiniDashboard([]); // limpa dashboard
      return;
    }

    renderizarAlunos(listaAlunos);
    atualizarGrafico(listaAlunos); // atualiza gráfico
    atualizarMiniDashboard(listaAlunos); // atualiza mini dashboard com os dados carregados
  } catch (err) {
    console.error("Erro ao carregar alunos:", err);
    container.innerHTML = `<p class="no-data">Erro ao carregar alunos. Verifique o console.</p>`;
  }
}

// ---------- RENDERIZA ALUNOS ----------
function renderizarAlunos(alunos, termoBusca = "") {
  const container = document.getElementById("accordionContainer");
  container.innerHTML = "";

  if (alunos.length === 0) {
    container.innerHTML = `<p class="no-data">Nenhum aluno encontrado.</p>`;
    return;
  }

  alunos.forEach((aluno) => {
    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";
    accordionItem.dataset.alunoId = aluno.id;

    const horariosFormatados =
      Array.isArray(aluno.horarios) && aluno.horarios.length > 0
        ? aluno.horarios
            .map((h) => `<tr><td>${h.dia}</td><td>${h.horario}</td></tr>`)
            .join("")
        : '<tr><td colspan="2" class="no-data">Nenhum horário registrado.</td></tr>';

    accordionItem.innerHTML = `
      <div class="accordion-header">
        <div class="toggle-btn">&gt;</div>
        <div class="header-flex">
          <div class="aluno-nome">${highlight(
            aluno.nome || "Nome não informado",
            termoBusca
          )}</div>
          <div class="summary-info">
            <span>${highlight(aluno.instituicao || "N/A", termoBusca)}</span>
            <span>${highlight(aluno.curso || "N/A", termoBusca)}</span>
            <span>${highlight(aluno.turno || "N/A", termoBusca)}</span>
          </div>
        </div>
          <button class="delete-btn" title="Excluir" data-id="${aluno.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0,0,256,256">
                  <g fill="#ffffff" fill-rule="nonzero" stroke="none">
                      <g transform="scale(9.84615,9.84615)">
                          <path d="M11,-0.03125c-0.83594,0 -1.65625,0.16406 -2.25,0.75c-0.59375,0.58594 -0.78125,1.41797 -0.78125,2.28125h-3.96875c-0.55078,0 -1,0.44922 -1,1h-1v2h22v-2h-1c0,-0.55078 -0.44922,-1 -1,-1h-3.96875c0,-0.86328 -0.1875,-1.69531 -0.78125,-2.28125c-0.59375,-0.58594 -1.41406,-0.75 -2.25,-0.75zM11,2.03125h4c0.54688,0 0.71875,0.12891 0.78125,0.1875c0.0625,0.05859 0.1875,0.22266 0.1875,0.78125h-5.9375c0,-0.55859 0.125,-0.72266 0.1875,-0.78125c0.0625,-0.05859 0.23438,-0.1875 0.78125,-0.1875zM4,7v16c0,1.65234 1.34766,3 3,3h12c1.65234,0 3,-1.34766 3,-3v-16zM8,10h2v12h-2zM12,10h2v12h-2zM16,10h2v12h-2z"></path>
                      </g>
                  </g>
              </svg>
          </button>
      </div>
      <div class="accordion-content">
        <div class="info-grid">
          <div class="info-item"><strong>Nome:</strong> ${highlight(
            aluno.nome || "-",
            termoBusca
          )}</div>
          <div class="info-item"><strong>Email:</strong> ${highlight(
            aluno.email || "-",
            termoBusca
          )}</div>
          <div class="info-item"><strong>Instituição:</strong> ${highlight(
            aluno.instituicao || "-",
            termoBusca
          )}</div>
          <div class="info-item"><strong>Curso:</strong> ${highlight(
            aluno.curso || "-",
            termoBusca
          )}</div>
          <div class="info-item"><strong>Período:</strong> ${highlight(
            aluno.periodo ? aluno.periodo + "º" : "-",
            termoBusca
          )}</div>
          <div class="info-item"><strong>Turno:</strong> ${highlight(
            aluno.turno || "-",
            termoBusca
          )}</div>
          <div class="info-item"><strong>CPF:</strong> ${highlight(
            aluno.cpf || "-",
            termoBusca
          )}</div>
          <div class="info-item"><strong>Telefone:</strong> ${highlight(
            aluno.telefone || "-",
            termoBusca
          )}</div>
        </div>
        <div class="horarios">
          <h3>Horários Registrados</h3>
          <table>
            <thead><tr><th>Dia</th><th>Horário</th></tr></thead>
            <tbody>${horariosFormatados}</tbody>
          </table>
        </div>
      </div>
    `;
    container.appendChild(accordionItem);
  });
}

// ---------- EXCLUI ALUNO ----------
async function excluirAluno(alunoId) {
  if (
    confirm(
      "Tem certeza que deseja excluir este aluno e todos os seus horários registrados?"
    )
  ) {
    try {
      const res = await fetch(`/admin/${alunoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao excluir aluno");

      alert("Aluno excluído com sucesso!");
      const itemParaRemover = document.querySelector(
        `.accordion-item[data-aluno-id="${alunoId}"]`
      );
      if (itemParaRemover) itemParaRemover.remove();
      listaAlunos = listaAlunos.filter((a) => a.id !== alunoId);

      // atualiza gráfico e mini dashboard após remoção
      atualizarGrafico(listaAlunos);
      atualizarMiniDashboard(listaAlunos);
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      alert("Erro ao excluir aluno: " + error.message);
    }
  }
}

// ---------- FILTRO DE PESQUISA ----------
document.getElementById("barraPesquisa").addEventListener("keyup", (e) => {
  const termo = (e.target.value || "").toLowerCase();
  let alunosParaFiltrar = listaAlunos;

  if (instituicaoSelecionada) {
    alunosParaFiltrar = listaAlunos.filter(
      (a) =>
        a.instituicao &&
        a.instituicao.trim().toLowerCase() ===
          instituicaoSelecionada.toLowerCase()
    );
  }

  const filtrados = alunosParaFiltrar.filter(
    (aluno) =>
      (aluno.nome ?? "").toLowerCase().includes(termo) ||
      (aluno.email ?? "").toLowerCase().includes(termo) ||
      (aluno.instituicao ?? "").toLowerCase().includes(termo) ||
      (aluno.curso ?? "").toLowerCase().includes(termo)
  );
  renderizarAlunos(filtrados, termo);
  atualizarMiniDashboard(filtrados);
});

// ---------- GRÁFICO DE INSTITUIÇÕES ----------
function atualizarGrafico(alunos) {
  const canvas = document.getElementById("instituicoesChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const instituicoes = {};
  alunos.forEach((a) => {
    if (a.instituicao) {
      const nomeNormalizado = a.instituicao.trim().toLowerCase();
      const chave =
        nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);
      instituicoes[chave] = (instituicoes[chave] || 0) + 1;
    }
  });

  const labels = Object.keys(instituicoes);
  const data = Object.values(instituicoes);

  if (chartInstituicoes) chartInstituicoes.destroy();

  coresOriginais = labels.map((_, i) => `hsl(${(i * 60) % 360}, 70%, 60%)`);

  chartInstituicoes = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Alunos por instituição",
          data,
          backgroundColor: [...coresOriginais],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      elements: { arc: { borderWidth: 1 } },
      onClick: (evt, elements) => {
        const termoAtual =
          (document.getElementById("barraPesquisa")?.value || "").toLowerCase();
        if (!elements.length) return;
        const index = elements[0].index;
        const instituicaoClicada =
          chartInstituicoes.data.labels[index];

        if (instituicaoSelecionada === instituicaoClicada) {
          instituicaoSelecionada = null;
          const base1 = listaAlunos;
          const filtrados1 = termoAtual
            ? base1.filter(
                (a) =>
                  (a.nome ?? "").toLowerCase().includes(termoAtual) ||
                  (a.email ?? "").toLowerCase().includes(termoAtual) ||
                  (a.instituicao ?? "").toLowerCase().includes(termoAtual) ||
                  (a.curso ?? "").toLowerCase().includes(termoAtual)
              )
            : base1;
          renderizarAlunos(filtrados1, termoAtual);
          atualizarMiniDashboard(filtrados1);

          chartInstituicoes.data.labels = labels;
          chartInstituicoes.data.datasets[0].data = data;
          chartInstituicoes.data.datasets[0].backgroundColor = [
            ...coresOriginais,
          ];
        } else {
          instituicaoSelecionada = instituicaoClicada;
          const filtrados = listaAlunos.filter(
            (a) =>
              a.instituicao &&
              a.instituicao.trim().toLowerCase() ===
                instituicaoClicada.toLowerCase()
          );
          const base2 = filtrados;
          const filtrados2 = termoAtual
            ? base2.filter(
                (a) =>
                  (a.nome ?? "").toLowerCase().includes(termoAtual) ||
                  (a.email ?? "").toLowerCase().includes(termoAtual) ||
                  (a.instituicao ?? "").toLowerCase().includes(termoAtual) ||
                  (a.curso ?? "").toLowerCase().includes(termoAtual)
              )
            : base2;
          renderizarAlunos(filtrados2, termoAtual);
          atualizarMiniDashboard(filtrados2);

          const originalIndex = labels.indexOf(instituicaoClicada);
          const corSelecionada = coresOriginais[originalIndex];
          const valorSelecionado = data[originalIndex];

          chartInstituicoes.data.labels = [instituicaoClicada];
          chartInstituicoes.data.datasets[0].data = [valorSelecionado];
          chartInstituicoes.data.datasets[0].backgroundColor = [corSelecionada];
        }

        chartInstituicoes.update({
          duration: 800,
          easing: "easeInOutCubic",
        });
      },
    },
  });
}

// ---------- MINI DASHBOARD DE ESTATÍSTICAS ----------
function atualizarMiniDashboard(alunos) {
  const total = alunos.length;
  const instituicoes = new Set(alunos.map(a => (a.instituicao ?? "").trim().toLowerCase()).filter(Boolean)).size;
  const turnoMat = alunos.filter(a => (a.turno ?? "").toLowerCase().includes("mat")).length;
  const turnoNot = alunos.filter(a => (a.turno ?? "").toLowerCase().includes("not")).length;

  const elTotal = document.getElementById("totalAlunos");
  const elInst = document.getElementById("totalInstituicoes");
  const elMat = document.getElementById("turnoMatutino");
  const elNot = document.getElementById("turnoNoturno");

  if (elTotal) elTotal.textContent = total;
  if (elInst) elInst.textContent = instituicoes;
  if (elMat) elMat.textContent = turnoMat;
  if (elNot) elNot.textContent = turnoNot;
}

// ---------- LOGOUT ----------
window.logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tipoUsuario");
  window.location.href = "index.html";
};

// ---------- MENU LATERAL ----------
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};

// ---------- INICIALIZA ----------
carregarAlunos();

// Delegação de eventos: accordion e exclusão
document
  .getElementById("accordionContainer")
  .addEventListener("click", (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    if (deleteButton) {
      e.stopPropagation();
      excluirAluno(deleteButton.dataset.id);
      return;
    }

    const header = e.target.closest(".accordion-header");
    if (header) {
      const item = header.parentElement;
      item.classList.toggle("open");
    }
  });
