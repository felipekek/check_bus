// frontend/js/respostas_feedback.js
// Mantém: ordenação por data (mais recentes primeiro), paginação, busca e verificação de admin.
// Padrão do drawer igual ao relatorios (toggleMenu global).

// (Opcional) Integração com o modal de perfil, se existir no seu projeto.
import { carregarModalPerfil, abrirPerfil } from "../js/perfil.js";

/* ================= Config/Helpers ================= */
const API_BASE = window.__API_BASE__ ?? ""; // relativo ao mesmo host por padrão
const getToken = () => localStorage.getItem("token") || "";
const isAdmin = () => (localStorage.getItem("tipoUsuario") || "").toLowerCase() === "admin";

const sanitize = (s) =>
  String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

const fmtData = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d)
    ? "-"
    : d.toLocaleString("pt-BR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

/* ================= Estado ================= */
let feedbacks = [];  // todos
let filtrados = [];  // após busca
let paginaAtual = 1;
let porPagina = 10;

/* ================= Elementos ================= */
const tbody = document.getElementById("corpoTabela");
const barraPesquisa = document.getElementById("barraPesquisa");
const paginacaoEl = document.getElementById("paginacao");

/* ================= Drawer (mesmo padrão do relatorios) ================= */
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};
// O CSS de draw.css já estiliza .menu-btn, .overlay e .sidebar com as mesmas transições. :contentReference[oaicite:1]{index=1}

/* ================= Perfil (opcional) ================= */
async function initPerfilLocal() {
  try {
    await carregarModalPerfil?.();
    const btnPerfil = document.getElementById("btnPerfil");
    if (btnPerfil) btnPerfil.addEventListener("click", () => abrirPerfil?.());
  } catch (e) {
    console.warn("Perfil opcional não inicializado:", e);
  }
}

/* ================= Fetch + Render ================= */
async function carregarFeedbacks() {
  if (!tbody) return;

  // Mensagem de loading
  tbody.innerHTML = `<tr><td colspan="5" class="no-feedback">Carregando feedbacks...</td></tr>`;

  // Proteção: painel só para admin (rota GET /feedback exige requireAdmin)
  if (!isAdmin()) {
    tbody.innerHTML = `<tr><td colspan="5" class="no-feedback">Acesso restrito a administradores.</td></tr>`;
    renderPaginacao(0);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/feedback`, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      credentials: "include",
    });

    if (!res.ok) {
      tbody.innerHTML = `<tr><td colspan="5" class="no-feedback">Erro ${res.status} ao carregar feedbacks.</td></tr>`;
      renderPaginacao(0);
      return;
    }

    const lista = await res.json();

    // Ordena por data desc (mais recentes primeiro)
    feedbacks = Array.isArray(lista)
      ? lista.slice().sort((a, b) => (new Date(b?.data || 0)) - (new Date(a?.data || 0)))
      : [];

    aplicarBusca(); // inicializa filtrados e renderiza
  } catch (err) {
    console.error("Erro ao carregar feedbacks:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="no-feedback">Erro ao carregar feedbacks.</td></tr>`;
    renderPaginacao(0);
  }
}

/* ================= Busca + Paginação ================= */
function aplicarBusca() {
  const termo = (barraPesquisa?.value || "").trim().toLowerCase();

  filtrados = !termo
    ? feedbacks
    : feedbacks.filter((f) => {
        const texto = `${f?.nome ?? ""} ${f?.email ?? ""} ${f?.cpf ?? ""} ${f?.comentario ?? ""}`.toLowerCase();
        return texto.includes(termo);
      });

  paginaAtual = 1; // volta para a primeira página sempre que buscar
  renderTabela();
  renderPaginacao(Math.ceil(filtrados.length / porPagina));
}

function obterPagina(lista, pagina, tamanho) {
  const start = (pagina - 1) * tamanho;
  return lista.slice(start, start + tamanho);
}

function renderTabela() {
  if (!tbody) return;

  if (!Array.isArray(filtrados) || filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="no-feedback">Nenhum feedback encontrado.</td></tr>`;
    return;
  }

  const pageItems = obterPagina(filtrados, paginaAtual, porPagina);

  tbody.innerHTML = pageItems
    .map((f) => {
      const nome = f.nome || "-";
      const email = f.email || "-";
      const cpf = f.cpf || "-";
      const comentario = f.comentario || "-";
      const data = fmtData(f.data);

      return `
        <tr data-row>
          <td>${sanitize(nome)}</td>
          <td>${sanitize(email)}</td>
          <td>${sanitize(cpf)}</td>
          <td>${sanitize(comentario)}</td>
          <td>${sanitize(data)}</td>
        </tr>
      `;
    })
    .join("");
}

function botao(label, onClick, disabled = false, aria = "") {
  const b = document.createElement("button");
  b.textContent = label;
  b.type = "button";
  b.className = "pager-btn";
  if (aria) b.setAttribute("aria-label", aria);
  b.disabled = !!disabled;
  b.addEventListener("click", onClick);
  return b;
}

function renderPaginacao(totalPaginas) {
  if (!paginacaoEl) return;

  if (!totalPaginas) totalPaginas = Math.ceil((filtrados?.length || 0) / porPagina);

  paginacaoEl.innerHTML = "";

  if (totalPaginas <= 1) return;

  const primeira = botao("«", () => { paginaAtual = 1; renderTabela(); renderPaginacao(totalPaginas); }, paginaAtual === 1, "Primeira página");
  const anterior  = botao("‹", () => { paginaAtual = Math.max(1, paginaAtual - 1); renderTabela(); renderPaginacao(totalPaginas); }, paginaAtual === 1, "Página anterior");
  paginacaoEl.appendChild(primeira);
  paginacaoEl.appendChild(anterior);

  const MAX = 7;
  let ini = Math.max(1, paginaAtual - 3);
  let fim = Math.min(totalPaginas, ini + MAX - 1);
  if (fim - ini + 1 < MAX) ini = Math.max(1, fim - MAX + 1);

  for (let p = ini; p <= fim; p++) {
    const b = botao(String(p), () => {
      paginaAtual = p;
      renderTabela();
      renderPaginacao(totalPaginas);
    }, false, `Ir para a página ${p}`);

    if (p === paginaAtual) b.classList.add("ativo");
    paginacaoEl.appendChild(b);
  }

  const proxima = botao("›", () => { paginaAtual = Math.min(totalPaginas, paginaAtual + 1); renderTabela(); renderPaginacao(totalPaginas); }, paginaAtual === totalPaginas, "Próxima página");
  const ultima  = botao("»", () => { paginaAtual = totalPaginas; renderTabela(); renderPaginacao(totalPaginas); }, paginaAtual === totalPaginas, "Última página");
  paginacaoEl.appendChild(proxima);
  paginacaoEl.appendChild(ultima);

  const info = document.createElement("span");
  info.className = "pager-info";
  const total = filtrados.length;
  const iniIdx = (paginaAtual - 1) * porPagina + 1;
  const fimIdx = Math.min(paginaAtual * porPagina, total);
  info.textContent = `Exibindo ${total ? iniIdx : 0}–${total ? fimIdx : 0} de ${total}`;
  paginacaoEl.appendChild(info);
}

/* ================= Eventos ================= */
if (barraPesquisa && !barraPesquisa._bound) {
  barraPesquisa._bound = true;
  barraPesquisa.addEventListener("input", aplicarBusca);
}

/* ================= Boot ================= */
document.addEventListener("DOMContentLoaded", async () => {
  await initPerfilLocal();
  await carregarFeedbacks();
});

/* ================= Logout global ================= */
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
window.logout = logout;

// export opcional
export { carregarFeedbacks };
