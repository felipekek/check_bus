import { carregarModalPerfil, abrirPerfil } from "../js/perfil.js";

/* ================= CONFIG ================= */
const API_BASE = window.__API_BASE__ ?? "";
const getToken = () => localStorage.getItem("token") || "";
const isAdmin = () =>
  (localStorage.getItem("tipoUsuario") || "").toLowerCase() === "admin";

/* ================= ESTADO ================= */
let feedbacks = [];
let filtrados = [];
let paginaAtual = 1;
const porPagina = 10;
let feedbackSelecionado = null;

/* ================= ELEMENTOS ================= */
const tbody = document.getElementById("corpoTabela");
const barraPesquisa = document.getElementById("barraPesquisa");
const paginacaoEl = document.getElementById("paginacao");

const modal = document.getElementById("modalResposta");
const textarea = document.getElementById("textoResposta");
const btnCancelar = document.getElementById("cancelarResposta");
const btnEnviar = document.getElementById("enviarResposta");

/* ================= UTIL ================= */
const sanitize = (s) =>
  String(s ?? "").replace(/[<>&"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c])
  );

const fmtData = (iso) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";

/* ================= MENU (DRAWER) - SEM MEXER NO draw.css ================= */
function getSidebarEl() {
  // compatível com sidebar injetado por sidebar-universal.js
  return (
    document.getElementById("sidebar") ||
    document.querySelector(".sidebar") ||
    document.querySelector("#sidebar-container .sidebar")
  );
}

function getOverlayEl() {
  return document.getElementById("overlay") || document.querySelector(".overlay");
}

function fecharMenu() {
  const sidebar = getSidebarEl();
  const overlay = getOverlayEl();

  sidebar?.classList.remove("active");
  overlay?.classList.remove("active");
}

window.toggleMenu = () => {
  const sidebar = getSidebarEl();
  const overlay = getOverlayEl();

  // se sidebar não existir ainda (carregamento async), não faz nada pra não travar
  if (!sidebar || !overlay) return;

  const vaiAbrir = !sidebar.classList.contains("active");

  if (vaiAbrir) {
    sidebar.classList.add("active");
    overlay.classList.add("active");
  } else {
    fecharMenu();
  }
};

/* Fecha menu clicando no overlay (garante que o overlay não fique fantasma) */
document.addEventListener("click", (e) => {
  const overlay = getOverlayEl();
  if (!overlay) return;

  if (e.target === overlay && overlay.classList.contains("active")) {
    fecharMenu();
  }
});

/* ================= PERFIL ================= */
async function initPerfil() {
  try {
    await carregarModalPerfil?.();
    document
      .getElementById("btnPerfil")
      ?.addEventListener("click", () => abrirPerfil?.());
  } catch (err) {
    console.warn("Perfil não carregado:", err);
  }
}

/* ================= FETCH ================= */
async function carregarFeedbacks() {
  if (!isAdmin()) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="no-feedback">
          Acesso restrito a administradores.
        </td>
      </tr>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/feedback`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    feedbacks = res.ok ? await res.json() : [];
    aplicarBusca();
  } catch {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="no-feedback">
          Erro ao carregar feedbacks.
        </td>
      </tr>`;
  }
}

/* ================= BUSCA ================= */
function aplicarBusca() {
  const termo = barraPesquisa.value.toLowerCase();

  filtrados = !termo
    ? feedbacks
    : feedbacks.filter((f) =>
        `${f.nome} ${f.email} ${f.cpf} ${f.comentario}`
          .toLowerCase()
          .includes(termo)
      );

  paginaAtual = 1;
  renderTabela();
  renderPaginacao();
}

/* ================= RENDER ================= */
function renderTabela() {
  if (!filtrados.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="no-feedback">
          Nenhum feedback encontrado.
        </td>
      </tr>`;
    return;
  }

  const inicio = (paginaAtual - 1) * porPagina;
  const pagina = filtrados.slice(inicio, inicio + porPagina);

  tbody.innerHTML = pagina
    .map(
      (f) => `
      <tr>
        <td>${sanitize(f.nome)}</td>
        <td>${sanitize(f.email)}</td>
        <td>${sanitize(f.cpf)}</td>
        <td>${sanitize(f.comentario)}</td>
        <td>${fmtData(f.data)}</td>
        <td>
          <button class="btn-responder" data-id="${f.id}" title="Responder">✉️</button>
          <button class="btn-excluir" data-id="${f.id}" title="Excluir">🗑️</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function renderPaginacao() {
  paginacaoEl.innerHTML = "";
  const total = Math.ceil(filtrados.length / porPagina);
  if (total <= 1) return;

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `pager-btn ${i === paginaAtual ? "ativo" : ""}`;
    btn.onclick = () => {
      paginaAtual = i;
      renderTabela();
      renderPaginacao();
    };
    paginacaoEl.appendChild(btn);
  }
}

/* ================= AÇÕES ================= */
tbody.addEventListener("click", async (e) => {
  const btnExcluir = e.target.closest(".btn-excluir");
  const btnResponder = e.target.closest(".btn-responder");

  /* ===== EXCLUIR ===== */
  if (btnExcluir) {
    const id = btnExcluir.dataset.id;
    if (!confirm("Deseja realmente excluir este feedback?")) return;

    try {
      const res = await fetch(`${API_BASE}/feedback/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) return alert("Erro ao excluir feedback.");

      feedbacks = feedbacks.filter((f) => f.id !== id);
      aplicarBusca();
    } catch {
      alert("Erro inesperado ao excluir feedback.");
    }
  }

  /* ===== RESPONDER ===== */
  if (btnResponder) {
    feedbackSelecionado = btnResponder.dataset.id;
    textarea.value = "";

    // Fecha menu/overlay corretamente (sem depender de #sidebar)
    fecharMenu();

    modal.classList.add("active");
  }
});

/* ================= MODAL ================= */
btnCancelar.onclick = () => {
  modal.classList.remove("active");
  feedbackSelecionado = null;
};

btnEnviar.onclick = async () => {
  const mensagem = textarea.value.trim();
  if (!mensagem) return alert("Digite a resposta.");

  try {
    const res = await fetch(
      `${API_BASE}/feedback/${feedbackSelecionado}/responder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ mensagem }),
      }
    );

    if (!res.ok) return alert("Erro ao enviar resposta.");

    alert("Resposta enviada com sucesso!");
    modal.classList.remove("active");
  } catch {
    alert("Erro inesperado ao enviar resposta.");
  }
};

/* ================= BOOT ================= */
document.addEventListener("DOMContentLoaded", async () => {
  await initPerfil();
  await carregarFeedbacks();
  barraPesquisa.addEventListener("input", aplicarBusca);
});
