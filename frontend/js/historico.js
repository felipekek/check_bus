const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Apenas aluno pode acessar
if (!token || tipoUsuario !== "aluno") {
  window.location.href = "index.html";
}

const tbody = document.querySelector("#tabela-historico tbody");
const barraPesquisa = document.getElementById("barraPesquisa");

let registros = [];

/* ================================
   Carregar histórico
================================ */
async function carregarHistorico() {
  tbody.innerHTML = `
    <tr><td colspan="3" class="no-data">Carregando registros...</td></tr>
  `;

  try {
    const res = await fetch("/historico", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Erro na resposta");

    const data = await res.json();

    // ================================
    // Aluno SEM cartão
    // ================================
    if (data.semCartao) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="no-data">
            ⚠️ Você ainda não possui um cartão vinculado.<br>
            Procure a administração.
          </td>
        </tr>
      `;
      return;
    }

    registros = data.historico;
    renderizarTabela();

  } catch (error) {
    console.error(error);
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="no-data">
          ❌ Erro ao carregar registros.
        </td>
      </tr>
    `;
  }
}

/* ================================
   Renderizar tabela
================================ */
function renderizarTabela() {
  tbody.innerHTML = "";

  if (!registros || registros.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="3" class="no-data">Nenhum embarque encontrado.</td></tr>
    `;
    return;
  }

  registros.forEach(reg => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${reg.idCartao || "-"}</td>
      <td>${formatarData(reg.data)}</td>
      <td>${reg.horario || "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ================================
   Formatar data
================================ */
function formatarData(iso) {
  if (!iso || iso === "-") return "-";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/* ================================
   Barra de pesquisa
================================ */
barraPesquisa.addEventListener("keyup", () => {
  const filtro = barraPesquisa.value.toLowerCase();
  document.querySelectorAll("#tabela-historico tbody tr").forEach(tr => {
    tr.style.display = tr.textContent.toLowerCase().includes(filtro) ? "" : "none";
  });
});

/* ================================
   Inicializar
================================ */
carregarHistorico();

/* MENU LATERAL */
window.toggleMenu = () => {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
};
