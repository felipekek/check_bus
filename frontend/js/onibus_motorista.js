// =====================================================
// IMPORTA FIREBASE AUTH
// =====================================================
import { auth } from "./firebase-config.js";

const API = "http://localhost:3000";

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
let modoEditar = null; // <-- guarda o ID da config ao editar

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
  const token = await getIdToken();
  const res = await fetch(`${API}/motoristas/listar`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const lista = await res.json();
  motoristasCache = lista;

  selectMotorista.innerHTML = `<option value="">Selecione...</option>`;
  lista.forEach(m => {
    selectMotorista.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
  });
}

// -----------------------------------------------------
// CARREGAR ÔNIBUS
// -----------------------------------------------------
async function carregarOnibus() {
  const token = await getIdToken();
  const res = await fetch(`${API}/onibus/listar`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const lista = await res.json();
  onibusCache = lista;

  selectOnibus.innerHTML = `<option value="">Selecione...</option>`;
  lista.forEach(o => {
    selectOnibus.innerHTML += `<option value="${o.id}">Ônibus ${o.numero}</option>`;
  });
}

// -----------------------------------------------------
// CARREGAR CONFIGURAÇÕES SALVAS
// -----------------------------------------------------
async function carregarConfiguracoes() {
  const token = await getIdToken();

  const res = await fetch(`${API}/configuracoesRotas`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const lista = await res.json();

  listaConfiguracoes.innerHTML = "";

  lista.forEach(cfg => {
    listaConfiguracoes.innerHTML += `
      <li>
        <div class="config-info">
          <strong>${cfg.motoristaNome}</strong>
          Ônibus ${cfg.onibusNumero} • ${cfg.turno}
          <br>
          Dias: ${cfg.dias.join(", ")}
          <br>
          Instituições: ${cfg.rota.join(" → ")}
        </div>

        <div class="config-acoes">
          <button class="btn-editar" onclick="editarConfig('${cfg.id}')">Editar</button>
          <button class="btn-excluir" onclick="excluirConfig('${cfg.id}')">Excluir</button>
        </div>
      </li>
    `;
  });
}

// -----------------------------------------------------
// COLETAR CONFIGURAÇÃO DO FORMULÁRIO
// -----------------------------------------------------
function coletar() {
  const motoristaId = selectMotorista.value;
  const motoristaNome =
    motoristasCache.find(m => m.id === motoristaId)?.nome || "";

  const onibusId = selectOnibus.value;
  const onibusNumero =
    onibusCache.find(o => o.id === onibusId)?.numero || "";

  const turno = selectTurno.value;

  const dias = [...document.querySelectorAll(".dias-grid input:checked")].map(el => el.value);
  const rota = [...document.querySelectorAll(".checkbox-list input:checked")].map(el => el.value);

  return { motoristaId, motoristaNome, onibusId, onibusNumero, turno, dias, rota };
}

// -----------------------------------------------------
// SALVAR / ATUALIZAR
// -----------------------------------------------------
btnSalvar.addEventListener("click", async () => {
  const cfg = coletar();
  const token = await getIdToken();

  if (!cfg.motoristaId || !cfg.onibusId || !cfg.turno || cfg.dias.length === 0 || cfg.rota.length === 0) {
    alert("Preencha todos os dados!");
    return;
  }

  // ATUALIZAR
  if (modoEditar) {
  const res = await fetch(`${API}/configuracoesRotas/${modoEditar}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cfg)
  });

  alert("Configuração atualizada!");

  // ENCERRAR MODO DE EDIÇÃO
  modoEditar = null;

  // LIMPAR FORMULÁRIO APÓS EDITAR
  resetarFormulario();
}

  // CRIAR NOVA
  else {
    await fetch(`${API}/configuracoesRotas`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cfg)
    });
    alert("Configuração salva!");
  }

  await carregarConfiguracoes();
});

// -----------------------------------------------------
// EXCLUIR
// -----------------------------------------------------
window.excluirConfig = async (id) => {
  if (!confirm("Excluir esta configuração?")) return;

  const token = await getIdToken();

  await fetch(`${API}/configuracoesRotas/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  await carregarConfiguracoes();
};

// -----------------------------------------------------
// EDITAR CONFIGURAÇÃO
// -----------------------------------------------------
window.editarConfig = async (id) => {
  modoEditar = id;

  const token = await getIdToken();

  const res = await fetch(`${API}/configuracoesRotas`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const lista = await res.json();
  const cfg = lista.find(c => c.id === id);

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
};

// -----------------------------------------------------
// INICIALIZAÇÃO
// -----------------------------------------------------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "novo_login.html";
    return;
  }

  carregarMotoristas();
  carregarOnibus();
  carregarConfiguracoes();

  // montar lista instituições
  ["UEFS","FTC","UNEF","Anhanguera","Estácio","SENAI Feira"].forEach(i => {
    listaInstituicoes.innerHTML += `
      <label><input type="checkbox" value="${i}"> ${i}</label>
    `;
  });
});

function resetarFormulario() {
  // Resetar selects
  selectMotorista.value = "";
  selectOnibus.value = "";
  selectTurno.value = "";

  // Resetar dias da semana
  document.querySelectorAll(".dias-grid input").forEach(chk => chk.checked = false);

  // Resetar instituições
  document.querySelectorAll(".checkbox-list input").forEach(chk => chk.checked = false);

  // Resetar resumo
  resumoLista.innerHTML = `<li>Nenhuma configuração selecionada ainda.</li>`;
}
