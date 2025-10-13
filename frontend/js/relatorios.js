/**
 * frontend/js/relatorios.js
 * Página de Relatórios (Admin)
 * Lista, filtra, exclui registros e permite gerar PDFs completos ou filtrados.
 */

const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// 🔒 Controle de acesso (apenas admin)
if (!token || tipoUsuario !== "admin") {
  window.location.href = "index.html";
}

const filtroInstituicao = document.getElementById("filtro-instituicao");
const filtroTurno = document.getElementById("filtro-turno");
const filtroData = document.getElementById("filtro-data");
const listaDiv = document.getElementById("lista");

let registros = []; // Armazena os registros carregados

/**
 * Carrega relatórios do backend
 */
async function carregarRelatorios() {
  listaDiv.innerHTML = `
    <table id="tabela-relatorios">
      <thead>
        <tr>
          <th>Aluno</th>
          <th>ID Cartão</th>
          <th>Curso</th>
          <th>Instituição</th>
          <th>Período</th>
          <th>Turno</th>
          <th>Data</th>
          <th>Horário</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr><td colspan="9" class="no-data">Carregando registros...</td></tr>
      </tbody>
    </table>
  `;

  try {
    const res = await fetch("/relatorios", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erro ao buscar relatórios");

    registros = await res.json();
    preencherFiltros();
    renderizarLista();
  } catch (err) {
    console.error("Erro ao carregar relatórios:", err);
    const tbody = document.querySelector("#tabela-relatorios tbody");
    tbody.innerHTML = `<tr><td colspan="9" class="no-data">Erro ao carregar registros.</td></tr>`;
  }
}

/**
 * Preenche filtros fixos
 */
function preencherFiltros() {
  const instituicoes = ["SENAI", "UEFS", "IFBA", "UNEFS"];
  const turnos = ["Manhã", "Tarde", "Noite"];

  filtroInstituicao.innerHTML = '<option value="">Todas as instituições</option>';
  filtroTurno.innerHTML = '<option value="">Todos os turnos</option>';

  instituicoes.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    filtroInstituicao.appendChild(opt);
  });

  turnos.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    filtroTurno.appendChild(opt);
  });
}

/**
 * Formata data no formato DD/MM/YYYY
 */
function formatarData(dataISO) {
  if (!dataISO) return "";
  const partes = dataISO.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/**
 * Renderiza a tabela de registros
 */
function renderizarLista() {
  const tbody = document.querySelector("#tabela-relatorios tbody");
  tbody.innerHTML = "";

  const inst = filtroInstituicao.value;
  const turno = filtroTurno.value;
  const data = filtroData.value;

  const filtrados = registros.filter(r => 
    (inst === "" || r.instituicao === inst) &&
    (turno === "" || r.turno === turno) &&
    (data === "" || r.data === data)
  );

  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="no-data">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  filtrados.forEach(reg => {
    const tr = document.createElement("tr");
    const dataFormatada = formatarData(reg.data);

    tr.innerHTML = `
      <td>${reg.aluno || "-"}</td>
      <td>${reg.idCartao || "-"}</td>
      <td>${reg.curso || "-"}</td>
      <td>${reg.instituicao || "-"}</td>
      <td>${reg.periodo || "-"}</td>
      <td>${reg.turno || "-"}</td>
      <td>${dataFormatada || "-"}</td>
      <td>${reg.horario || "-"}</td>
      <td>
        <button class="delete-btn" data-id="${reg.id}" title="Excluir">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0,0,256,256">
            <g fill="#ffffff" fill-rule="nonzero" stroke="none">
              <g transform="scale(9.84615,9.84615)">
                <path d="M11,-0.03125c-0.83594,0 -1.65625,0.16406 -2.25,0.75c-0.59375,0.58594 -0.78125,1.41797 -0.78125,2.28125h-3.96875c-0.55078,0 -1,0.44922 -1,1h-1v2h22v-2h-1c0,-0.55078 -0.44922,-1 -1,-1h-3.96875c0,-0.86328 -0.1875,-1.69531 -0.78125,-2.28125c-0.59375,-0.58594 -1.41406,-0.75 -2.25,-0.75zM11,2.03125h4c0.54688,0 0.71875,0.12891 0.78125,0.1875c0.0625,0.05859 0.1875,0.22266 0.1875,0.78125h-5.9375c0,-0.55859 0.125,-0.72266 0.1875,-0.78125c0.0625,-0.05859 0.23438,-0.1875 0.78125,-0.1875zM4,7v16c0,1.65234 1.34766,3 3,3h12c1.65234,0 3,-1.34766 3,-3v-16zM8,10h2v12h-2zM12,10h2v12h-2zM16,10h2v12h-2z"></path>
              </g>
            </g>
          </svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      if (confirm("Deseja realmente excluir este registro?")) {
        await excluirRelatorio(btn.dataset.id);
      }
    };
  });
}

/**
 * Exclui um relatório por ID
 */
async function excluirRelatorio(id) {
  try {
    const res = await fetch(`/relatorios/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erro ao excluir");
    await carregarRelatorios();
  } catch (err) {
    alert("Erro ao excluir registro.");
  }
}

/* ======== FILTROS E PESQUISA ======== */
filtroInstituicao.addEventListener("change", renderizarLista);
filtroTurno.addEventListener("change", renderizarLista);
filtroData.addEventListener("change", renderizarLista);

document.getElementById("barraPesquisa").addEventListener("keyup", function() {
  const filtro = this.value.toLowerCase();
  document.querySelectorAll("#tabela-relatorios tbody tr").forEach(tr => {
    if (!tr.classList.contains("no-data")) {
      const texto = tr.textContent.toLowerCase();
      tr.style.display = texto.includes(filtro) ? "" : "none";
    }
  });
});

/* ======== LOGOUT ======== */
window.logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tipoUsuario");
  window.location.href = "index.html";
};

/* ======== MENU LATERAL ======== */
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};

/* ======== INICIALIZAÇÃO ======== */
carregarRelatorios();

/* ======== MODAL DE DOWNLOAD ======== */
const modal = document.getElementById("modalRelatorio");
document.getElementById("botaoBaixarRelatorio").addEventListener("click", () => {
  modal.style.display = "block";
});
document.getElementById("fecharModal").addEventListener("click", () => {
  modal.style.display = "none";
});
window.addEventListener("click", (event) => {
  if (event.target === modal) modal.style.display = "none";
});

/* ======== CHECKBOX "TODAS AS OPÇÕES" ======== */
const checkboxTodas = document.getElementById("checkboxTodas");
const checkboxes = document.querySelectorAll(".checkbox-coluna");

checkboxTodas.addEventListener("change", () => {
  checkboxes.forEach(cb => cb.checked = checkboxTodas.checked);
});

checkboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    const todosMarcados = Array.from(checkboxes).every(c => c.checked);
    checkboxTodas.checked = todosMarcados;
  });
});

/* ======== GERAR PDF (FILTRADO) ======== */
document.getElementById("confirmarDownload").addEventListener("click", async () => {
  try {
    // 1️⃣ Colunas selecionadas
    const colunasSelecionadas = Array.from(document.querySelectorAll(".checkbox-coluna:checked"))
      .map(cb => cb.dataset.chave);

    const colunas = colunasSelecionadas.length > 0 
      ? colunasSelecionadas 
      : ["aluno","idCartao","curso","instituicao","periodo","turno","data","horario"];

    // 2️⃣ Linhas visíveis (após filtros)
    const linhasVisiveis = Array.from(document.querySelectorAll("#tabela-relatorios tbody tr"))
      .filter(tr => tr.style.display !== "none" && !tr.classList.contains("no-data"))
      .map(tr => {
        const celulas = tr.querySelectorAll("td");
        return {
          aluno: celulas[0]?.textContent || "-",
          idCartao: celulas[1]?.textContent || "-",
          curso: celulas[2]?.textContent || "-",
          instituicao: celulas[3]?.textContent || "-",
          periodo: celulas[4]?.textContent || "-",
          turno: celulas[5]?.textContent || "-",
          data: celulas[6]?.textContent || "-",
          horario: celulas[7]?.textContent || "-"
        };
      });

    // 3️⃣ Se nada filtrado, avisa
    if (linhasVisiveis.length === 0) {
      alert("Nenhum registro filtrado encontrado para baixar.");
      return;
    }

    // 4️⃣ Envia para backend
    const res = await fetch(`/relatorios/pdf-filtrado`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ colunas, registros: linhasVisiveis })
    });

    if (!res.ok) throw new Error("Erro ao gerar PDF filtrado");

    // 5️⃣ Baixa o arquivo
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorios_filtrados.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    modal.style.display = "none";
  } catch (err) {
    alert("Erro ao baixar PDF: " + err.message);
    console.error(err);
  }
});
