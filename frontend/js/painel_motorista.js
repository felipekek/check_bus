const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Impede acesso se não for motorista
if (!token || tipoUsuario !== "motorista") {
  alert("Acesso negado!");
  window.location.href = "index.html";
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
    if (!res.ok) throw new Error("Erro ao buscar dados do motorista");

    const motorista = await res.json();

    document.getElementById("nomeMotorista").textContent = motorista.nome;
    document.getElementById("emailMotorista").textContent = motorista.email;
    document.getElementById("cnhCategoria").textContent = motorista.cnhCategoria;
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
          <td>${rota.nome}</td>
          <td>${rota.horario}</td>
          <td>${rota.pontoInicial}</td>
          <td>${rota.pontoFinal}</td>
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
