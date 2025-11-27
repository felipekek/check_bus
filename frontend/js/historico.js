// frontend/js/historico.js

const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");
const uid = localStorage.getItem("uid");

// Apenas aluno pode acessar
if (!token || tipoUsuario !== "aluno") {
    window.location.href = "index.html";
}

const tbody = document.querySelector("#tabela-historico tbody");
const barraPesquisa = document.getElementById("barraPesquisa");

let registros = [];

/* ================================
   Carregar histórico do backend
================================ */
async function carregarHistorico() {
    tbody.innerHTML = `
        <tr><td colspan="3" class="no-data">Carregando registros...</td></tr>
    `;

    try {
        const res = await fetch(`/historico?uid=${uid}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Erro ao carregar histórico");

        registros = await res.json();
        renderizarTabela();

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `
            <tr><td colspan="3" class="no-data">Erro ao carregar registros.</td></tr>
        `;
    }
}

/* ================================
   Exibir tabela
================================ */
function renderizarTabela() {
    tbody.innerHTML = "";

    if (registros.length === 0) {
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
    if (!iso) return "-";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
}

/* ================================
   Barra de pesquisa
================================ */
barraPesquisa.addEventListener("keyup", () => {
    const filtro = barraPesquisa.value.toLowerCase();

    document.querySelectorAll("#tabela-historico tbody tr").forEach(tr => {
        const texto = tr.textContent.toLowerCase();
        tr.style.display = texto.includes(filtro) ? "" : "none";
    });
});

/* ================================
   Inicializar
================================ */
carregarHistorico();

/* MENU LATERAL */
window.toggleMenu = () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const menuBtn = document.querySelector(".menu-btn");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    menuBtn.classList.toggle("hidden");
};
