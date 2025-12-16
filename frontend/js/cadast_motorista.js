// cadast_motorista.js - CORRIGIDO
// URLs dinâmicas + sanitização de HTML

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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formMotorista");

  // Máscaras
  const cpfMask = IMask(document.getElementById("cpf"), { mask: "000.000.000-00" });
  const telefoneMask = IMask(document.getElementById("telefone"), { mask: "(00) 00000-0000" });

  // Foto
  const fotoInput = document.getElementById("fotoMotorista");
  const previewFoto = document.getElementById("previewFotoMotorista");
  const btnRemoverFoto = document.getElementById("btnRemoverFoto");

  let fotoBase64 = null;

  fotoInput.addEventListener("change", () => {
    const file = fotoInput.files[0];
    if (file) {
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("⚠️ A imagem deve ter no máximo 5MB.");
        fotoInput.value = "";
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        fotoBase64 = reader.result;
        previewFoto.src = fotoBase64;
      };
      reader.readAsDataURL(file);
    }
  });

  btnRemoverFoto.addEventListener("click", () => {
    fotoInput.value = "";
    fotoBase64 = null;
    previewFoto.src = "../imagens/placeholder_user.png";
  });

  // CPF Validation
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;

    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto >= 10) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto >= 10) resto = 0;

    return resto === parseInt(cpf[10]);
  };

  // ============================
  // SUBMIT
  // ============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cnh = document.getElementById("cnh").value.trim();
    const categoria = document.getElementById("categoria").value;
    const validadeCnh = document.getElementById("validadeCnh").value;
    const turno = document.getElementById("turno").value;
    const status = document.getElementById("status").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    // VALIDAÇÕES
    if (!nome || !email || !cpf || !telefone || !cnh || !categoria || !validadeCnh || !turno) {
      alert("⚠️ Preencha todos os campos obrigatórios!");
      return;
    }

    if (!validarCPF(cpf)) {
      alert("❌ CPF inválido!");
      return;
    }

    if (new Date(validadeCnh) < new Date()) {
      alert("❌ A CNH está vencida!");
      return;
    }

    if (!senha || senha.length < 6) {
      alert("⚠️ A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("⚠️ As senhas não coincidem!");
      return;
    }

    // Montar JSON
    const dados = {
      nome,
      email,
      cpf,
      telefone,
      cnh,
      categoria,
      validadeCnh,
      turno,
      status,
      senha,
      fotoBase64
    };

    try {
      const response = await fetch(`${API}/motoristas/cadastrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      const data = await response.json();

      if (!response.ok) {
        alert("❌ Erro ao cadastrar motorista: " + data.erro);
        return;
      }

      alert("✅ Motorista cadastrado com sucesso!");
      form.reset();
      fotoBase64 = null;
      previewFoto.src = "../imagens/placeholder_user.png";

      carregarMotoristas();

    } catch (err) {
      console.error(err);
      alert("Erro ao conectar ao servidor.");
    }
  });

  // ============================
  // LISTAR MOTORISTAS
  // ============================
  async function carregarMotoristas() {
    try {
      const response = await fetch(`${API}/motoristas/listar`);
      const dados = await response.json();

      const lista = document.getElementById("listaMotoristas");
      lista.innerHTML = "";

      dados.forEach((m) => {
        const card = document.createElement("div");
        card.className = "motorista-card";

        // Usando escapeHtml para prevenir XSS
        card.innerHTML = `
          <img src="${escapeHtml(m.fotoUrl) || '../imagens/placeholder_user.png'}" class="foto-lista" onerror="this.src='../imagens/placeholder_user.png'">
          <div class="motorista-nome">${escapeHtml(m.nome)}</div>
          <div class="motorista-info">📧 ${escapeHtml(m.email)}</div>
          <div class="motorista-info">📞 ${escapeHtml(m.telefone)}</div>
          <div class="motorista-info">🪪 CNH: ${escapeHtml(m.cnh)} (${escapeHtml(m.categoria)})</div>
          <div class="motorista-info">🕒 Turno: ${escapeHtml(m.turno)}</div>
          <div class="motorista-info ${m.status === "Ativo" ? "status-ativo" : "status-inativo"}">● ${escapeHtml(m.status)}</div>

          <div class="motorista-actions">
            <button class="btn-edit" data-id="${escapeHtml(m.id)}" data-nome="${escapeHtml(m.nome)}" data-telefone="${escapeHtml(m.telefone)}" data-turno="${escapeHtml(m.turno)}" data-status="${escapeHtml(m.status)}">Editar</button>
            <button class="btn-delete" data-id="${escapeHtml(m.id)}">Excluir</button>
          </div>
        `;

        // Event listeners via delegação
        card.querySelector(".btn-edit").addEventListener("click", (e) => {
          const btn = e.target;
          abrirEditar(btn.dataset.id, btn.dataset.nome, btn.dataset.telefone, btn.dataset.turno, btn.dataset.status);
        });

        card.querySelector(".btn-delete").addEventListener("click", (e) => {
          excluirMotorista(e.target.dataset.id);
        });

        lista.appendChild(card);
      });

    } catch (err) {
      console.error("Erro ao carregar motoristas", err);
    }
  }

  // ============================
  // EDITAR
  // ============================
  function abrirEditar(id, nome, telefone, turno, status) {
    document.getElementById("editId").value = id;
    document.getElementById("editNome").value = nome;
    document.getElementById("editTelefone").value = telefone;
    document.getElementById("editTurno").value = turno;
    document.getElementById("editStatus").value = status;

    document.getElementById("modalEditar").style.display = "flex";
  }

  document.getElementById("fecharEditar").onclick = () => {
    document.getElementById("modalEditar").style.display = "none";
  };

  document.getElementById("formEditarMotorista").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editId").value;

    const dados = {
      nome: document.getElementById("editNome").value,
      telefone: document.getElementById("editTelefone").value,
      turno: document.getElementById("editTurno").value,
      status: document.getElementById("editStatus").value,
    };

    const resp = await fetch(`${API}/motoristas/editar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (resp.ok) {
      alert("✔ Motorista atualizado!");
      document.getElementById("modalEditar").style.display = "none";
      carregarMotoristas();
    } else {
      alert("Erro ao atualizar motorista.");
    }
  });

  // ============================
  // EXCLUIR
  // ============================
  async function excluirMotorista(id) {
    if (!confirm("Deseja realmente excluir este motorista?")) return;

    const resp = await fetch(`${API}/motoristas/excluir/${id}`, {
      method: "DELETE",
    });

    if (resp.ok) {
      alert("✔ Motorista excluído!");
      carregarMotoristas();
    } else {
      alert("Erro ao excluir motorista.");
    }
  }

  // Busca dinâmica
  document.getElementById("buscarMotorista").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    document.querySelectorAll(".motorista-card").forEach(card => {
      card.style.display = card.innerText.toLowerCase().includes(termo)
        ? "block"
        : "none";
    });
  });

  carregarMotoristas();
});
