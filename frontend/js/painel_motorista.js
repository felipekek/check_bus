// painel_motorista.js - CORRIGIDO
// Validação de token no servidor obrigatória

// ========================================
// ⚠️ SEGURANÇA: VALIDAÇÃO DE TOKEN
// ========================================
// IMPORTANTE: A validação client-side SOZINHA não é segura!
// O backend DEVE validar o token em TODAS as rotas /motorista/*
// 
// Exemplo de middleware no backend (Express):
// 
// function verificarMotorista(req, res, next) {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ erro: "Token não fornecido" });
//   
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (decoded.tipoUsuario !== "motorista") {
//       return res.status(403).json({ erro: "Acesso negado" });
//     }
//     req.userId = decoded.userId;
//     next();
//   } catch (err) {
//     return res.status(401).json({ erro: "Token inválido" });
//   }
// }
// 
// app.get('/motorista/perfil', verificarMotorista, async (req, res) => { ... });
// ========================================

const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Impede acesso se não for motorista
if (!token || tipoUsuario !== "motorista") {
  alert("Acesso negado!");
  window.location.href = "index.html";
}

// === Sanitização HTML ===
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

// ---------- MENU ----------
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};

// ---------- LOGOUT ----------
window.logout = () => {
  localStorage.clear();
  window.location.href = "index.html";
};

// ---------- CARREGA DADOS DO MOTORISTA ----------
async function carregarMotorista() {
  try {
    const res = await fetch("/motorista/perfil", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (res.status === 401 || res.status === 403) {
      alert("Sessão expirada ou acesso negado. Faça login novamente.");
      localStorage.clear();
      window.location.href = "index.html";
      return;
    }
    
    if (!res.ok) throw new Error("Erro ao buscar dados do motorista");

    const motorista = await res.json();

    document.getElementById("nomeMotorista").textContent = escapeHtml(motorista.nome);
    document.getElementById("emailMotorista").textContent = escapeHtml(motorista.email);
    document.getElementById("cnhCategoria").textContent = escapeHtml(motorista.cnhCategoria);
    document.getElementById("statusRequisitos").textContent = motorista.requisitosValidados
      ? "✅ Todos os requisitos atendidos"
      : "⚠️ Requisitos pendentes";
  } catch (err) {
    console.error("Erro ao carregar motorista:", err);
  }
}

// ---------- CARREGA ROTAS ASSOCIADAS ----------
async function carregarRotas() {
  const corpo = document.querySelector("#tabelaRotas tbody");
  if (!corpo) return;
  
  corpo.innerHTML = `<tr><td colspan="4" class="no-data">Carregando rotas...</td></tr>`;

  try {
    const res = await fetch("/motorista/rotas", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error("Erro ao buscar rotas");

    const rotas = await res.json();

    if (rotas.length === 0) {
      corpo.innerHTML = `<tr><td colspan="4" class="no-data">Nenhuma rota atribuída.</td></tr>`;
      return;
    }

    corpo.innerHTML = "";
    rotas.forEach((rota) => {
      corpo.innerHTML += `
        <tr>
          <td>${escapeHtml(rota.nome)}</td>
          <td>${escapeHtml(rota.horario)}</td>
          <td>${escapeHtml(rota.pontoInicial)}</td>
          <td>${escapeHtml(rota.pontoFinal)}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Erro ao carregar rotas:", err);
    corpo.innerHTML = `<tr><td colspan="4" class="no-data">Erro ao carregar rotas.</td></tr>`;
  }
}

// ---------- INICIALIZA ----------
carregarMotorista();
carregarRotas();
