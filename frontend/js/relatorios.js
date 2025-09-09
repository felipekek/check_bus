const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Controle de acesso
if (!token || tipoUsuario !== "admin") {
  window.location.href = "index.html";
}

const filtroInstituicao = document.getElementById("filtro-instituicao");
const filtroCurso = document.getElementById("filtro-curso");
const filtroData = document.getElementById("filtro-data");
const listaDiv = document.getElementById("lista");

let registros = []; // Vai armazenar todos os registros carregados

async function carregarRelatorios() {
  // Inicializa tabela com carregando registros
  listaDiv.innerHTML = `
    <table id="tabela-relatorios">
      <thead>
        <tr>
          <th>Aluno</th>
          <th>Matrícula</th>
          <th>ID Cartão</th>
          <th>Instituição</th>
          <th>Curso</th>
          <th>Data</th>
          <th>Horário</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr><td colspan="8" class="no-data">Carregando registros...</td></tr>
      </tbody>
    </table>
  `;

  try {
    const res = await fetch("/relatorios", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erro ao buscar relatórios");

    registros = await res.json();

    if (registros.length === 0) {
      const tbody = document.querySelector("#tabela-relatorios tbody");
      tbody.innerHTML = `<tr><td colspan="8" class="no-data">Nenhum registro encontrado.</td></tr>`;
      return;
    }

    preencherFiltros();
    renderizarLista();
  } catch (err) {
    console.error("Erro ao carregar relatórios:", err);
    const tbody = document.querySelector("#tabela-relatorios tbody");
    tbody.innerHTML = `<tr><td colspan="8" class="no-data">Erro ao carregar registros.</td></tr>`;
  }
}

// Preenche os selects de filtros dinamicamente
function preencherFiltros() {
  // Exemplo de opções
  const instituicoes = ["SENAI", "UEFS", "IFBA","UNEFS"];
  const cursos = ["ADS", "ENGENHARIA", "DIREITO", "MEDICINA"];

  // Limpa as opções antigas
  filtroInstituicao.innerHTML = '<option value="">Todas as instituições</option>';
  filtroCurso.innerHTML = '<option value="">Todos os cursos</option>';

  // Adiciona novas opções
  instituicoes.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    filtroInstituicao.appendChild(opt);
  });

  cursos.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    filtroCurso.appendChild(opt);
  });
}

// Função para formatar a data no padrão brasileiro
function formatarData(dataISO) {
  if (!dataISO) return "";
  const partes = dataISO.split("-"); // [2025, 06, 17]
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Renderiza a lista de relatórios aplicando filtros
function renderizarLista() {
  const tbody = document.querySelector("#tabela-relatorios tbody");
  tbody.innerHTML = "";

  const inst = filtroInstituicao.value;
  const curso = filtroCurso.value;
  const data = filtroData.value;

  const filtrados = registros.filter(r => 
    (inst === "" || r.instituicao === inst) &&
    (curso === "" || r.curso === curso) &&
    (data === "" || r.data === data)
  );

  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="no-data">Nenhum registro encontrado.</td></tr>`;
    return;
  }

  filtrados.forEach(reg => {
    const tr = document.createElement("tr");

    // Formata a data antes de exibir
    const dataFormatada = formatarData(reg.data);

    tr.innerHTML = `
      <td>${reg.aluno}</td>
      <td>${reg.matricula}</td>
      <td>${reg.idCartao}</td>
      <td>${reg.instituicao}</td>
      <td>${reg.curso}</td>
      <td>${dataFormatada}</td>
      <td>${reg.horario}</td>
      <td>
        <button class="delete-btn" data-id="${reg.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0,0,256,256">
                    <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
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

  // Botões de exclusão
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      if (confirm("Deseja realmente excluir este registro?")) {
        await excluirRelatorio(btn.dataset.id);
      }
    };
  });
}


// Função para excluir
async function excluirRelatorio(id) {
  try {
    const res = await fetch(`/relatorios/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Erro ao excluir");
    await carregarRelatorios(); // Recarrega lista e filtros
  } catch (err) {
    alert("Erro ao excluir registro.");
  }
}

// Eventos de filtros
filtroInstituicao.addEventListener("change", renderizarLista);
filtroCurso.addEventListener("change", renderizarLista);
filtroData.addEventListener("change", renderizarLista);

// Barra de pesquisa
document.getElementById("barraPesquisa").addEventListener("keyup", function() {
  const filtro = this.value.toLowerCase();
  document.querySelectorAll("#tabela-relatorios tbody tr").forEach(tr => {
    if (!tr.classList.contains("no-data")) {
      const texto = tr.textContent.toLowerCase();
      tr.style.display = texto.includes(filtro) ? "" : "none";
    }
  });
});

// Logout
window.logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tipoUsuario");
  window.location.href = "index.html";
};

// Menu lateral
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};

// Inicializa
carregarRelatorios();

//função de baixar relatorio

// Modal - Abrir
document.getElementById("botaoBaixarRelatorio").addEventListener("click", () => {
  document.getElementById("modalRelatorio").style.display = "block";
});

// Modal - Fechar pelo X
document.getElementById("fecharModal").addEventListener("click", () => {
  document.getElementById("modalRelatorio").style.display = "none";
});

// Modal - Fechar clicando fora
window.addEventListener("click", (event) => {
  const modal = document.getElementById("modalRelatorio");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Ação do botão Baixar dentro do modal
document.getElementById("confirmarDownload").addEventListener("click", function () {
    if (!registros.length) return alert("Nenhum dado para exportar!");

    // Pega as colunas selecionadas
    const checkboxes = document.querySelectorAll('.filtros input[type="checkbox"]:checked');
    let colunasSelecionadas = Array.from(checkboxes)
        .map(cb => cb.value)
        .filter(val => val !== "todas");

    // Se "todas" estiver selecionada, exporta todas as colunas
    if (checkboxes.length === 0 || checkboxes[checkboxes.length - 1].value === "todas") {
        colunasSelecionadas = ["aluno", "matricula", "idCartao", "instituicao", "curso", "data", "horario"];
    }

    // Mapeia os nomes das colunas para títulos bonitos
    const titulos = {
        aluno: "Aluno",
        matricula: "Matrícula",
        idCartao: "ID Cartão",
        instituicao: "Instituição",
        curso: "Curso",
        data: "Data",
        horario: "Horário"
    };

    // Cabeçalhos para o PDF
    const colunasPDF = colunasSelecionadas.map(col => titulos[col]);

    // Dados das linhas
    const linhas = registros.map(reg =>
        colunasSelecionadas.map(col => {
            if (col === "data") return formatarData(reg[col]);
            return reg[col] || "";
        })
    );

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.autoTable({
        head: [colunasPDF],
        body: linhas,
    });

    doc.save("relatorios.pdf");

    // Fecha o modal após baixar
    document.getElementById("modalRelatorio").style.display = "none";
});

// Selecionar/desmarcar todos ao clicar em "Todas as opções"
document.querySelector('.filtros input[value="todas"]').addEventListener("change", function() {
    const todos = document.querySelectorAll('.filtros input[type="checkbox"]:not([value="todas"])');
    todos.forEach(cb => cb.checked = this.checked);
});




