// public/js/admin_onibus.js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const API_URL = "https://SEU_API_GATEWAY.execute-api.REGION.amazonaws.com/prod";

const grid = document.getElementById("cardsOnibus");
const barraPesquisa = document.getElementById("barraPesquisa");

let listaOnibus = [];
let listaMotoristas = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) return location.href = "index.html";
  if ((user.email || "").toLowerCase() !== "staff@adm.com") {
    alert("Acesso restrito a administradores.");
    return location.href = "home_principal.html";
  }
  await Promise.all([carregarOnibus(), carregarMotoristas()]);
  render(listaOnibus);
});

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Sem usuário");
  return await user.getIdToken();
}

async function carregarOnibus() {
  grid.innerHTML = `<p class="no-data">Carregando ônibus...</p>`;
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/onibus`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Falha ao listar ônibus");
    listaOnibus = await res.json();
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<p class="no-data">Não foi possível carregar os ônibus.</p>`;
  }
}

async function carregarMotoristas() {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/motoristas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Falha ao listar motoristas");
    listaMotoristas = await res.json();
  } catch (e) {
    console.error(e);
    listaMotoristas = [];
  }
}

function render(onibus) {
  if (!onibus.length) {
    grid.innerHTML = `<p class="no-data">Nenhum ônibus encontrado.</p>`;
    return;
  }
  grid.innerHTML = "";
  onibus.forEach(o => {
    const div = document.createElement("div");
    div.className = "card-bus";

    const ativo = !!o.ativo;
    const motorista = listaMotoristas.find(m => (m.id || m._id || m.uid) === o.motoristaId);

    div.innerHTML = `
      <div class="header">
        <div class="title"><i class="fa fa-bus"></i> ${o.nome || "(sem nome)"}</div>
        <span class="badge ${ativo ? "on" : "off"}">${ativo ? "Ativo" : "Inativo"}</span>
      </div>
      <div class="meta">
        <div><strong>Placa:</strong> ${o.placa || "-"}</div>
        <div><strong>Capacidade:</strong> ${o.capacidade ?? "-"}</div>
        <div><strong>Rota:</strong> ${o.rota || "-"}</div>
        <div><strong>Motorista:</strong> ${motorista ? (motorista.nome || motorista.email || motorista.uid) : "—"}</div>
      </div>
      <div class="actions">
        <select data-id="${o.id || o._id}" class="sel-motorista">
          <option value="">— Vincular motorista —</option>
          ${listaMotoristas.map(m => {
            const id = m.id || m._id || m.uid;
            const selected = id === o.motoristaId ? "selected" : "";
            const label = m.nome ? `${m.nome} (${m.email || ""})` : (m.email || id);
            return `<option value="${id}" ${selected}>${label}</option>`;
          }).join("")}
        </select>

        <button class="primary btn-salvar" data-id="${o.id || o._id}">
          <i class="fa fa-link"></i> Salvar vínculo
        </button>

        <button class="primary btn-toggle" data-id="${o.id || o._id}" data-ativo="${ativo ? 1 : 0}">
          <i class="fa fa-power-off"></i> ${ativo ? "Desativar" : "Ativar"}
        </button>

        <button class="danger btn-delete" data-id="${o.id || o._id}">
          <i class="fa fa-trash"></i> Excluir
        </button>
      </div>
    `;
    grid.appendChild(div);
  });

  // Ações
  document.querySelectorAll(".btn-salvar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const select = btn.parentElement.querySelector(".sel-motorista");
      const motoristaId = select.value || null;
      await vincularMotorista(id, motoristaId);
    });
  });

  document.querySelectorAll(".btn-toggle").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const ativo = btn.dataset.ativo === "1";
      await setAtivo(id, !ativo);
    });
  });

  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Deseja excluir este ônibus?")) return;
      const id = btn.dataset.id;
      await excluirOnibus(id);
    });
  });
}

barraPesquisa.addEventListener("input", () => {
  const termo = barraPesquisa.value.toLowerCase();
  const filtrados = listaOnibus.filter(o =>
    (o.nome || "").toLowerCase().includes(termo) ||
    (o.placa || "").toLowerCase().includes(termo) ||
    (o.rota || "").toLowerCase().includes(termo)
  );
  render(filtrados);
});

async function vincularMotorista(onibusId, motoristaId) {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/onibus/vincular`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ onibusId, motoristaId })
    });
    if (!res.ok) throw new Error("Falha ao salvar vínculo");
    await carregarOnibus();
    render(listaOnibus);
    alert("Vínculo atualizado com sucesso!");
  } catch (e) {
    console.error(e);
    alert("Erro ao vincular motorista.");
  }
}

async function setAtivo(onibusId, ativo) {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/onibus/${onibusId}/ativo`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ativo })
    });
    if (!res.ok) throw new Error("Falha ao alterar status");
    await carregarOnibus();
    render(listaOnibus);
  } catch (e) {
    console.error(e);
    alert("Erro ao alterar status do ônibus.");
  }
}

async function excluirOnibus(onibusId) {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/onibus/${onibusId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Falha na exclusão");
    await carregarOnibus();
    render(listaOnibus);
  } catch (e) {
    console.error(e);
    alert("Erro ao excluir ônibus.");
  }
}
