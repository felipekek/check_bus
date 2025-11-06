// frontend/js/respostas_feedback.js
import { carregarModalPerfil, abrirPerfil } from "../js/perfil.js";

/* ================= Helpers ================= */
const API_BASE = ""; // relativo ao mesmo host
const getToken = () => localStorage.getItem("token") || "";
const isAdmin = () => (localStorage.getItem("tipoUsuario") || "").toLowerCase() === "admin";

/* ================= Drawer (local) ================= */
function initDrawerLocal() {
  const body = document.body;
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");
  if (!sidebar || !overlay || !menuBtn) return;

  const toggleMenu = () => {
    const isActive = sidebar.classList.toggle("active");
    overlay.classList.toggle("active", isActive);
    menuBtn.classList.toggle("hidden", isActive);
    body.classList.toggle("drawer-open", isActive); // igual às outras páginas
    sidebar.setAttribute("aria-hidden", String(!isActive));
  };

  // remove possíveis listeners duplicados clonando os elementos
  menuBtn.replaceWith(menuBtn.cloneNode(true));
  overlay.replaceWith(overlay.cloneNode(true));

  // re-seleciona após clone
  const menuBtn2 = document.querySelector(".menu-btn");
  const overlay2 = document.getElementById("overlay");

  menuBtn2.addEventListener("click", toggleMenu);
  overlay2.addEventListener("click", toggleMenu);

  // navegação dos botões do drawer
  document.querySelectorAll("#sidebar [data-link]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const link = btn.getAttribute("data-link");
      if (link) window.location.href = link;
    });
  });

  // ESC fecha o drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) toggleMenu();
  });

  // expõe global (algumas páginas usam onclick="toggleMenu()")
  window.toggleMenu = toggleMenu;
}

/* ================= Perfil ================= */
async function initPerfilLocal() {
  try {
    await carregarModalPerfil(); // injeta HTML do modal de perfil
    const btnPerfil = document.getElementById("btnPerfil");
    if (btnPerfil) btnPerfil.addEventListener("click", abrirPerfil);
  } catch (e) {
    console.error("Falha ao carregar modal de perfil:", e);
  }
}

/* ================= Feedbacks ================= */
async function carregarFeedbacks() {
  const tbody = document.getElementById("corpoTabela");
  const barraPesquisa = document.getElementById("barraPesquisa");
  if (!tbody) return;

  if (!isAdmin()) {
    tbody.innerHTML = `<tr><td colspan="6" class="no-feedback">Acesso restrito a administradores.</td></tr>`;
    return;
  }

  try {
    tbody.innerHTML = `<tr><td colspan="6" class="no-feedback">Carregando feedbacks...</td></tr>`;

    const res = await fetch(`${API_BASE}/feedback`, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });

    if (!res.ok) throw new Error(`Erro ${res.status}: não foi possível listar feedbacks`);

    const lista = await res.json();
    if (!Array.isArray(lista) || lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="no-feedback">Nenhum feedback encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((f) => {
      const aluno = f.aluno || "-";
      const email = f.email || "-";
      const cpf = f.cpf || "-";
      const texto = f.texto || "-";
      const resposta = f.respostaAdmin || "-";
      const id = f.id || "";
      return `
        <tr data-row>
          <td>${sanitize(aluno)}</td>
          <td>${sanitize(email)}</td>
          <td>${sanitize(cpf)}</td>
          <td>${sanitize(texto)}</td>
          <td>${sanitize(resposta)}</td>
          <td>
            <button class="btn-acao" data-acao="responder" data-id="${id}">Responder</button>
            <button class="btn-acao danger" data-acao="excluir" data-id="${id}">Excluir</button>
          </td>
        </tr>
      `;
    }).join("");

    if (barraPesquisa && !barraPesquisa._bound) {
      barraPesquisa._bound = true;
      barraPesquisa.addEventListener("input", () => {
        const termo = barraPesquisa.value.trim().toLowerCase();
        tbody.querySelectorAll("[data-row]").forEach((tr) => {
          tr.style.display = tr.textContent.toLowerCase().includes(termo) ? "" : "none";
        });
      });
    }

    tbody.onclick = async (e) => {
      const btn = e.target.closest(".btn-acao");
      if (!btn) return;

      const id = btn.dataset.id;
      const acao = btn.dataset.acao;
      if (!id || !acao) return;

      if (acao === "responder") {
        const resposta = prompt("Digite a resposta do admin:");
        if (resposta && resposta.trim()) {
          await salvarResposta(id, resposta.trim());
          await carregarFeedbacks();
        }
      } else if (acao === "excluir") {
        if (confirm("Deseja realmente excluir este feedback?")) {
          await excluirFeedback(id);
          await carregarFeedbacks();
        }
      }
    };
  } catch (err) {
    console.error("Erro ao carregar feedbacks:", err);
    tbody.innerHTML = `<tr><td colspan="6" class="no-feedback">Erro ao carregar feedbacks.</td></tr>`;
  }
}

async function salvarResposta(id, resposta) {
  try {
    const res = await fetch(`${API_BASE}/feedback/${id}/responder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify({ resposta }),
    });
    if (!res.ok) throw new Error("Falha ao salvar resposta");
  } catch (e) {
    alert("Erro ao salvar resposta.");
    console.error(e);
  }
}

async function excluirFeedback(id) {
  try {
    const res = await fetch(`${API_BASE}/feedback/${id}`, {
      method: "DELETE",
      headers: {
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Falha ao excluir feedback");
  } catch (e) {
    alert("Erro ao excluir feedback.");
    console.error(e);
  }
}

/* ================= Util ================= */
function sanitize(str) {
  return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

/* ================= Boot ================= */
document.addEventListener("DOMContentLoaded", async () => {
  initDrawerLocal();
  await initPerfilLocal();
  await carregarFeedbacks();
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
window.logout = logout;

export { carregarFeedbacks };
