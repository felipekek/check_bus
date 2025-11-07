// public/js/cadast_onibus.js
import { app, auth } from "./firebase-config.js";
import {
  onAuthStateChanged, getIdToken
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const API_URL = "https://SEU_API_GATEWAY.execute-api.REGION.amazonaws.com/prod";

const form = document.getElementById("formOnibus");
const selMotorista = document.getElementById("motoristaId");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }
  if ((user.email || "").toLowerCase() !== "staff@adm.com") {
    alert("Acesso restrito a administradores.");
    location.href = "home_principal.html";
    return;
  }
  await carregarMotoristas();
});

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  return await user.getIdToken();
}

async function carregarMotoristas() {
  selMotorista.innerHTML = `<option value="">— Selecionar motorista —</option>`;
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/motoristas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Falha ao listar motoristas");
    const motoristas = await res.json();
    motoristas.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id || m._id || m.uid;
      opt.textContent = m.nome ? `${m.nome} (${m.email || ""})` : (m.email || "Sem nome");
      selMotorista.appendChild(opt);
    });
  } catch (e) {
    console.error(e);
    alert("Não foi possível carregar motoristas.");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    nome: document.getElementById("nome").value.trim(),
    placa: document.getElementById("placa").value.trim().toUpperCase(),
    capacidade: Number(document.getElementById("capacidade").value),
    rota: document.getElementById("rota").value.trim(),
    motoristaId: selMotorista.value || null,
    ativo: document.getElementById("ativo").checked
  };

  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/admin/onibus`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.erro || "Falha ao cadastrar");
    }
    alert("Ônibus cadastrado com sucesso!");
    form.reset();
    document.getElementById("ativo").checked = true;
  } catch (e) {
    console.error(e);
    alert("Erro: " + e.message);
  }
});
