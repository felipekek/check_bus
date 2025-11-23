/* ======================================
   ELEMENTOS DA PÁGINA
====================================== */
const selectMotorista = document.getElementById("selectMotorista");
const selectOnibus = document.getElementById("selectOnibus");
const selectTurno = document.getElementById("selectTurno");
const listaInstituicoes = document.getElementById("listaInstituicoes");
const btnSalvar = document.getElementById("btnSalvar");
const resumoLista = document.getElementById("resumoLista");

/* ======================================
   DADOS FICTÍCIOS (depois virão do Firestore)
====================================== */
const motoristasFake = [
  { id: "1", nome: "Carlos Alberto" },
  { id: "2", nome: "João Batista" },
  { id: "3", nome: "Mariana Souza" },
];

const onibusFake = [
  { id: "A1", numero: "01" },
  { id: "A2", numero: "02" },
  { id: "A3", numero: "03" },
];

const instituicoesFake = [
  "UEFS",
  "FTC",
  "UNEF",
  "Anhanguera",
  "Estácio",
  "SENAI Feira"
];

/* ======================================
   POPULAR SELECTS E LISTAS
====================================== */
motoristasFake.forEach(m => {
  selectMotorista.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
});

onibusFake.forEach(o => {
  selectOnibus.innerHTML += `<option value="${o.id}">Ônibus ${o.numero}</option>`;
});

instituicoesFake.forEach(i => {
  listaInstituicoes.innerHTML += `
    <label>
      <input type="checkbox" value="${i}">
      ${i}
    </label>
  `;
});

/* ======================================
   MAPA (Leaflet) – visão geral
====================================== */
const mapa = L.map('mapa').setView([-12.2664, -38.9663], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(mapa);

// Pontos exemplo (você pode ajustar depois)
const pontosRota = [
  { nome: "UEFS", coords: [-12.2068, -38.9577] },
  { nome: "FTC", coords: [-12.2480, -38.9518] },
  { nome: "UNEF", coords: [-12.2555, -38.9622] }
];

pontosRota.forEach(p => {
  L.marker(p.coords).addTo(mapa).bindPopup(`<b>${p.nome}</b>`);
});

/* ======================================
   FUNÇÃO PARA LER FORMULÁRIO
====================================== */
function coletarConfiguracao() {
  const motoristaId = selectMotorista.value;
  const onibusId = selectOnibus.value;
  const turno = selectTurno.value;

  const dias = [...document.querySelectorAll(".dias-grid input:checked")].map(el => el.value);
  const rota = [...document.querySelectorAll(".checkbox-list input:checked")].map(el => el.value);

  const motoristaNome = motoristasFake.find(m => m.id === motoristaId)?.nome || "";
  const onibusNumero = onibusFake.find(o => o.id === onibusId)?.numero || "";

  return {
    motoristaId,
    motoristaNome,
    onibusId,
    onibusNumero,
    turno,
    dias,
    rota,
  };
}

/* ======================================
   ATUALIZAR RESUMO NA TELA
====================================== */
function atualizarResumo(config) {
  if (!config.motoristaId && !config.onibusId && !config.turno && config.dias.length === 0 && config.rota.length === 0) {
    resumoLista.innerHTML = `<li>Nenhuma configuração selecionada ainda.</li>`;
    return;
  }

  resumoLista.innerHTML = `
    <li><strong>Motorista:</strong> ${config.motoristaNome || "Não selecionado"}</li>
    <li><strong>Ônibus:</strong> ${config.onibusNumero ? "Ônibus " + config.onibusNumero : "Não selecionado"}</li>
    <li><strong>Turno:</strong> ${config.turno || "Não selecionado"}</li>
    <li><strong>Dias da semana:</strong> ${config.dias.length ? config.dias.join(", ") : "Nenhum dia selecionado"}</li>
    <li><strong>Instituições / Rota:</strong> ${config.rota.length ? config.rota.join(" → ") : "Nenhuma instituição marcada"}</li>
  `;
}

/* Atualiza resumo sempre que mudar algo (mais intuitivo pro ADM) */
["change", "input"].forEach(evt => {
  document.addEventListener(evt, () => {
    const cfg = coletarConfiguracao();
    atualizarResumo(cfg);
  });
});

/* ======================================
   CLIQUE EM SALVAR CONFIGURAÇÃO
====================================== */
btnSalvar.addEventListener("click", () => {
  const config = coletarConfiguracao();

  if (!config.motoristaId || !config.onibusId || !config.turno || config.dias.length === 0 || config.rota.length === 0) {
    alert("⚠️ Preencha motorista, ônibus, turno, pelo menos um dia e pelo menos uma instituição.");
    return;
  }

  atualizarResumo(config);

  console.log("Configuração pronta para enviar ao backend:", config);
  alert("✅ Configuração salva (placeholder). Depois enviaremos isso para o backend/Firestore.");
});

/* ======================================
   PERFIL ADM – abrir / fechar modais
====================================== */
const btnPerfil = document.getElementById("btnPerfil");
const modalPerfil = document.getElementById("modalPerfil");
const btnFecharPerfil = document.getElementById("btnFecharPerfil");

const modalAlterarSenha = document.getElementById("modalAlterarSenha");
const btnAlterarSenha = document.getElementById("btnAlterarSenha");
const btnFecharSenha = document.getElementById("btnFecharSenha");

const modalAtualizarEmail = document.getElementById("modalAtualizarEmail");
const btnAtualizarEmail = document.getElementById("btnAtualizarEmail");
const btnFecharEmail = document.getElementById("btnFecharEmail");

// Abrir modal perfil
btnPerfil?.addEventListener("click", () => {
  modalPerfil.style.display = "block";
});

// Fechar modal perfil
btnFecharPerfil?.addEventListener("click", () => {
  modalPerfil.style.display = "none";
});

// Abrir/fechar alterar senha
btnAlterarSenha?.addEventListener("click", () => {
  modalAlterarSenha.style.display = "block";
});

btnFecharSenha?.addEventListener("click", () => {
  modalAlterarSenha.style.display = "none";
});

// Abrir/fechar atualizar e-mail
btnAtualizarEmail?.addEventListener("click", () => {
  modalAtualizarEmail.style.display = "block";
});

btnFecharEmail?.addEventListener("click", () => {
  modalAtualizarEmail.style.display = "none";
});

// Fechar modais ao clicar fora
window.addEventListener("click", (e) => {
  if (e.target === modalPerfil) modalPerfil.style.display = "none";
  if (e.target === modalAlterarSenha) modalAlterarSenha.style.display = "none";
  if (e.target === modalAtualizarEmail) modalAtualizarEmail.style.display = "none";
});
