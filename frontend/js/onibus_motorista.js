// onibus_motorista.js - CORRIGIDO
// URLs dinâmicas + sanitização de HTML

import { auth } from "./firebase-config.js";

// =====================================
// CONFIGURAÇÃO DINÂMICA DA API
// =====================================
const API = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : window.location.origin;

// =====================================
// SANITIZAÇÃO DE HTML (previne XSS)
// =====================================
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

// ELEMENTOS
const selectMotorista = document.getElementById("selectMotorista");
const selectOnibus = document.getElementById("selectOnibus");
const selectTurno = document.getElementById("selectTurno");
const listaInstituicoes = document.getElementById("listaInstituicoes");
const btnSalvar = document.getElementById("btnSalvar");
const resumoLista = document.getElementById("resumoLista");
const listaConfiguracoes = document.getElementById("listaConfiguracoes");

let motoristasCache = [];
let onibusCache = [];
let modoEditar = null;

// -----------------------------------------------------
// TOKEN
// -----------------------------------------------------
async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

// -----------------------------------------------------
// CARREGAR MOTORISTAS
// -----------------------------------------------------
async function carregarMotoristas() {
  try {
    const token = await getIdToken();
    const res = await fetch(`${API}/motoristas/listar`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const lista = await res.json();
    motoristasCache = lista;

    selectMotorista.innerHTML = `<option value="">Selecione...</option>`;
    lista.forEach(m => {
      const option = document.createElement("option");
      option.value = m.id;
      option.textContent = m.nome;
      selectMotorista.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar motoristas:", err);
  }
}

// -----------------------------------------------------
// CARREGAR ÔNIBUS
// -----------------------------------------------------
async function carregarOnibus() {
  try {
    const token = await getIdToken();
    const res = await fetch(`${API}/onibus/listar`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const lista = await res.json();
    onibusCache = lista;

    selectOnibus.innerHTML = `<option value="">Selecione...</option>`;
    lista.forEach(o => {
      const option = document.createElement("option");
      option.value = o.id;
      option.textContent = `Ônibus ${o.numero}`;
      selectOnibus.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar ônibus:", err);
  }
}

// -----------------------------------------------------
// CARREGAR CONFIGURAÇÕES SALVAS
// -----------------------------------------------------
async function carregarConfiguracoes() {
  try {
    const token = await getIdToken();
    const res = await fetch(`${API}/configuracoesRotas`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const lista = await res.json();
    listaConfiguracoes.innerHTML = "";

    lista.forEach(cfg => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="config-info">
          <strong>${escapeHtml(cfg.motoristaNome)}</strong>
          Ônibus ${escapeHtml(cfg.onibusNumero)} • ${escapeHtml(cfg.turno)}
          <br>
          Dias: ${cfg.dias.map(d => escapeHtml(d)).join(", ")}
          <br>
          Instituições: ${cfg.rota.map(r => escapeHtml(r)).join(" → ")}
        </div>

        <div class="config-acoes">
          <button class="btn-editar" data-id="${escapeHtml(cfg.id)}">Editar</button>
          <button class="btn-excluir" data-id="${escapeHtml(cfg.id)}">Excluir</button>
        </div>
      `;

      // Event listeners
      li.querySelector(".btn-editar").addEventListener("click", () => editarConfig(cfg.id));
      li.querySelector(".btn-excluir").addEventListener("click", () => excluirConfig(cfg.id));

      listaConfiguracoes.appendChild(li);
    });
  } catch (err) {
    console.error("Erro ao carregar configurações:", err);
  }
}

// -----------------------------------------------------
// COLETAR CONFIGURAÇÃO DO FORMULÁRIO
// -----------------------------------------------------
function coletar() {
  const motoristaId = selectMotorista.value;
  const motoristaNome = motoristasCache.find(m => m.id === motoristaId)?.nome || "";

  const onibusId = selectOnibus.value;
  const onibusNumero = onibusCache.find(o => o.id === onibusId)?.numero || "";

  const turno = selectTurno.value;

  const dias = [...document.querySelectorAll(".dias-grid input:checked")].map(el => el.value);
  const rota = [...document.querySelectorAll(".checkbox-list input:checked")].map(el => el.value);

  return { motoristaId, motoristaNome, onibusId, onibusNumero, turno, dias, rota };
}

// -----------------------------------------------------
// SALVAR / ATUALIZAR
// -----------------------------------------------------
btnSalvar?.addEventListener("click", async () => {
  const cfg = coletar();
  const token = await getIdToken();

  if (!cfg.motoristaId || !cfg.onibusId || !cfg.turno || cfg.dias.length === 0 || cfg.rota.length === 0) {
    alert("Preencha todos os dados!");
    return;
  }

  try {
    // ATUALIZAR
    if (modoEditar) {
      const res = await fetch(`${API}/configuracoesRotas/${modoEditar}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(cfg)
      });

      if (!res.ok) throw new Error("Erro ao atualizar");

      alert("Configuração atualizada!");
      modoEditar = null;
      resetarFormulario();
    }
    // CRIAR NOVA
    else {
      const res = await fetch(`${API}/configuracoesRotas`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(cfg)
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      alert("Configuração salva!");
    }

    await carregarConfiguracoes();
  } catch (err) {
    console.error("Erro ao salvar configuração:", err);
    alert("Erro ao salvar configuração.");
  }
});

// -----------------------------------------------------
// EXCLUIR
// -----------------------------------------------------
async function excluirConfig(id) {
  if (!confirm("Excluir esta configuração?")) return;

  try {
    const token = await getIdToken();
    const res = await fetch(`${API}/configuracoesRotas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erro ao excluir");

    await carregarConfiguracoes();
  } catch (err) {
    console.error("Erro ao excluir configuração:", err);
    alert("Erro ao excluir configuração.");
  }
}

// -----------------------------------------------------
// EDITAR CONFIGURAÇÃO
// -----------------------------------------------------
async function editarConfig(id) {
  modoEditar = id;

  try {
    const token = await getIdToken();
    const res = await fetch(`${API}/configuracoesRotas`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const lista = await res.json();
    const cfg = lista.find(c => c.id === id);

    if (!cfg) {
      alert("Configuração não encontrada.");
      return;
    }

    // Preenche os selects
    selectMotorista.value = cfg.motoristaId;
    selectOnibus.value = cfg.onibusId;
    selectTurno.value = cfg.turno;

    // Preenche dias
    document.querySelectorAll(".dias-grid input").forEach(chk => {
      chk.checked = cfg.dias.includes(chk.value);
    });

    // Preenche instituições
    document.querySelectorAll(".checkbox-list input").forEach(chk => {
      chk.checked = cfg.rota.includes(chk.value);
    });

    alert("Modo edição ativado!");
  } catch (err) {
    console.error("Erro ao carregar configuração para edição:", err);
  }
}

// -----------------------------------------------------
// RESETAR FORMULÁRIO
// -----------------------------------------------------
function resetarFormulario() {
  selectMotorista.value = "";
  selectOnibus.value = "";
  selectTurno.value = "";

  document.querySelectorAll(".dias-grid input").forEach(chk => chk.checked = false);
  document.querySelectorAll(".checkbox-list input").forEach(chk => chk.checked = false);

  if (resumoLista) {
    resumoLista.innerHTML = `<li>Nenhuma configuração selecionada ainda.</li>`;
  }
}

// -----------------------------------------------------
// INICIALIZAÇÃO
// -----------------------------------------------------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  await carregarMotoristas();
  await carregarOnibus();
  await carregarConfiguracoes();

  // Montar lista instituições
  const instituicoes = ["UEFS", "FTC", "UNEF", "Anhanguera", "Estácio", "SENAI Feira"];
  if (listaInstituicoes) {
    listaInstituicoes.innerHTML = "";
    instituicoes.forEach(i => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" value="${escapeHtml(i)}"> ${escapeHtml(i)}`;
      listaInstituicoes.appendChild(label);
    });
  }
});
