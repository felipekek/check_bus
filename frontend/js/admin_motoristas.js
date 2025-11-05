// ========================================
// Painel de Motoristas (Admin)
// backend/public/js/admin_motoristas.js
// ========================================

import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app } from "./firebaseConfig.js";

const auth = getAuth(app);
const container = document.getElementById("motoristasContainer");
const barraPesquisa = document.getElementById("barraPesquisa");

// ========================================
// Carregar motoristas do backend
// ========================================
async function carregarMotoristas() {
  container.innerHTML = `<p class="no-data">Carregando motoristas...</p>`;

  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    container.innerHTML = `<p class="no-data">Acesso negado. Faça login novamente.</p>`;
    return;
  }

  try {
    const res = await fetch("/admin/motoristas", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erro ao buscar motoristas");

    const motoristas = await res.json();
    if (!motoristas.length) {
      container.innerHTML = `<p class="no-data">Nenhum motorista encontrado.</p>`;
      return;
    }

    exibirMotoristas(motoristas);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="no-data erro">Erro ao carregar motoristas.</p>`;
  }
}

// ========================================
// Exibir motoristas (Accordion)
// ========================================
function exibirMotoristas(motoristas) {
  container.innerHTML = "";

  motoristas.forEach((m) => {
    const requisitos = `
      <ul>
        <li>Idade: ${m.idade || "-"} anos</li>
        <li>CNH: ${m.cnhCategoria || "-"}</li>
        <li>Curso Transporte Coletivo: ${m.temCursoTransporteColetivo ? "✅" : "❌"}</li>
        <li>Experiência (B/C): ${m.experienciaCategoriaBC ? "✅" : "❌"}</li>
        <li>Sem infrações: ${!m.infracoesGravesRecentes ? "✅" : "❌"}</li>
        <li>Apto físico/mental: ${m.aptoFisicoMental ? "✅" : "❌"}</li>
      </ul>
    `;

    const div = document.createElement("div");
    div.classList.add("accordion-item");
    div.innerHTML = `
      <button class="accordion-header" aria-expanded="false">
        <span><i class="fa fa-bus"></i> ${m.nome || "Sem nome"}</span>
        <span class="status-tag ${m.validado ? "apto" : "inapto"}">
          ${m.validado ? "Apto ✅" : "Inapto ❌"}
        </span>
      </button>
      <div class="accordion-content">
        <p><strong>E-mail:</strong> ${m.email || "-"}</p>
        <p><strong>CNH:</strong> ${m.cnhNumero || "-"}</p>
        <p><strong>Requisitos:</strong></p>
        ${requisitos}
        <button class="btn-delete" data-id="${m.id}">
          <i class="fa fa-trash"></i> Excluir
        </button>
      </div>
    `;
    container.appendChild(div);
  });

  configurarAccordion();
  configurarExclusao();
}

// ========================================
// Accordion com animação
// ========================================
function configurarAccordion() {
  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const content = item.querySelector(".accordion-content");
      const aberto = item.classList.toggle("active");

      header.setAttribute("aria-expanded", aberto);
      content.style.maxHeight = aberto ? content.scrollHeight + "px" : null;
    });
  });
}

// ========================================
// Excluir motorista
// ========================================
function configurarExclusao() {
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();

      const id = btn.dataset.id;
      if (!confirm("Tem certeza que deseja excluir este motorista?")) return;

      btn.disabled = true;
      btn.innerHTML = `<i class="fa fa-spinner fa-spin"></i> Excluindo...`;

      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/admin/motoristas/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Erro ao excluir motorista");

        alert("Motorista excluído com sucesso!");
        carregarMotoristas();
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir motorista.");
        btn.disabled = false;
        btn.innerHTML = `<i class="fa fa-trash"></i> Excluir`;
      }
    });
  });
}

// ========================================
// Filtro de pesquisa
// ========================================
barraPesquisa.addEventListener("input", () => {
  const termo = barraPesquisa.value.toLowerCase();
  document.querySelectorAll(".accordion-item").forEach((item) => {
    const nome = item.querySelector(".accordion-header").textContent.toLowerCase();
    item.style.display = nome.includes(termo) ? "" : "none";
  });
});

// Inicialização
carregarMotoristas();