// frontend/js/cadastro_onibus.js - CORRIGIDO
// URLs dinâmicas + sanitização XSS

// =====================================
// CONFIGURAÇÃO DINÂMICA DA API
// =====================================
const API = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : window.location.origin;

// =====================================
// SANITIZAÇÃO HTML (previne XSS)
// =====================================
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

// =====================================
// ELEMENTOS DO FORMULÁRIO
// =====================================
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("formOnibus");
  const fotoInput = document.getElementById("fotoOnibus");
  const preview = document.getElementById("previewFoto");
  const btnRemover = document.getElementById("btnRemoverFoto");

  let fotoRemovida = false;

  // Preview da imagem
  fotoInput.addEventListener("change", () => {
    const file = fotoInput.files[0];
    if (file) {
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("⚠️ A imagem deve ter no máximo 5MB.");
        fotoInput.value = "";
        return;
      }
      preview.src = URL.createObjectURL(file);
      fotoRemovida = false;
    }
  });

  // Remover imagem
  btnRemover.addEventListener("click", () => {
    fotoInput.value = "";
    preview.src = "../imagens/placeholder_bus.png";
    fotoRemovida = true;
  });

  // =====================================
  // CADASTRAR ÔNIBUS
  // =====================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const numero = document.getElementById("numero").value.trim();
    const placa = document.getElementById("placa").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const ano = document.getElementById("ano").value;
    const capacidade = document.getElementById("capacidade").value;
    const tipo = document.getElementById("tipo").value;
    const status = document.getElementById("status").value;
    const observacoes = document.getElementById("observacoes").value.trim();

    const formData = new FormData();
    formData.append("numero", numero);
    formData.append("placa", placa);
    formData.append("modelo", modelo);
    formData.append("ano", ano);
    formData.append("capacidade", capacidade);
    formData.append("tipo", tipo);
    formData.append("status", status);
    formData.append("observacoes", observacoes);

    if (fotoRemovida) formData.append("fotoRemovida", "true");
    else if (fotoInput.files[0]) formData.append("foto", fotoInput.files[0]);

    try {
      const response = await fetch(`${API}/onibus/cadastrar`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        alert("❌ Erro: " + (data.erro || "Falha ao cadastrar"));
        return;
      }

      alert("Ônibus cadastrado com sucesso!");

      form.reset();
      preview.src = "../imagens/placeholder_bus.png";
      fotoRemovida = false;

      carregarOnibus();

    } catch (err) {
      console.error(err);
      alert("Erro ao conectar ao servidor.");
    }
  });

  // =====================================
  // LISTAR ÔNIBUS (COM PROTEÇÃO XSS)
  // =====================================
  async function carregarOnibus() {
    try {
      const res = await fetch(`${API}/onibus/listar`);
      const dados = await res.json();

      const lista = document.getElementById("listaOnibus");
      lista.innerHTML = "";

      dados.forEach(o => {
        const div = document.createElement("div");
        div.className = "onibus-card";

        // ✅ USANDO escapeHtml PARA PREVENIR XSS
        div.innerHTML = `
          <img src="${escapeHtml(o.fotoUrl) || '../imagens/placeholder_bus.png'}" class="foto-lista" onerror="this.src='../imagens/placeholder_bus.png'">

          <div class="onibus-nome">Ônibus ${escapeHtml(o.numero)}</div>
          <div class="onibus-info">Modelo: ${escapeHtml(o.modelo)}</div>
          <div class="onibus-info">Ano: ${escapeHtml(o.ano)}</div>
          <div class="onibus-info">Capacidade: ${escapeHtml(o.capacidade)}</div>

          <div class="onibus-actions">
            <button class="btn-edit" data-id="${escapeHtml(o.id)}">Editar</button>
            <button class="btn-delete" data-id="${escapeHtml(o.id)}">Excluir</button>
          </div>
        `;

        // Event listeners seguros
        const btnEdit = div.querySelector(".btn-edit");
        const btnDelete = div.querySelector(".btn-delete");

        btnEdit.addEventListener("click", () => {
          abrirEditar(o.id, o.numero, o.placa, o.modelo, o.ano, o.capacidade, o.tipo, o.status, o.observacoes || "");
        });

        btnDelete.addEventListener("click", () => {
          excluirOnibus(o.id);
        });

        lista.appendChild(div);
      });

    } catch (err) {
      console.error("Erro ao listar:", err);
    }
  }

  // Carregar lista ao entrar na página
  carregarOnibus();

  // =====================================
  // BUSCA DINÂMICA
  // =====================================
  document.getElementById("buscarOnibus").addEventListener("input", e => {
    const termo = e.target.value.toLowerCase();

    document.querySelectorAll(".onibus-card").forEach(card => {
      const texto = card.innerText.toLowerCase();
      card.style.display = texto.includes(termo) ? "block" : "none";
    });
  });

  // =====================================
  // MODAL DE EDIÇÃO
  // =====================================
  window.abrirEditar = (id, numero, placa, modelo, ano, capacidade, tipo, status, observacoes) => {
    document.getElementById("editId").value = id;
    document.getElementById("editNumero").value = numero;
    document.getElementById("editPlaca").value = placa;
    document.getElementById("editModelo").value = modelo;
    document.getElementById("editAno").value = ano;
    document.getElementById("editCapacidade").value = capacidade;
    document.getElementById("editTipo").value = tipo;
    document.getElementById("editStatus").value = status;
    document.getElementById("editObservacoes").value = observacoes;

    document.getElementById("modalEditarOnibus").style.display = "flex";
  };

  document.getElementById("fecharEditarOnibus").onclick = () => {
    document.getElementById("modalEditarOnibus").style.display = "none";
  };

  // SALVAR EDIÇÃO
  document.getElementById("formEditarOnibus").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editId").value;

    const dados = {
      numero: document.getElementById("editNumero").value,
      placa: document.getElementById("editPlaca").value,
      modelo: document.getElementById("editModelo").value,
      ano: document.getElementById("editAno").value,
      capacidade: document.getElementById("editCapacidade").value,
      tipo: document.getElementById("editTipo").value,
      status: document.getElementById("editStatus").value,
      observacoes: document.getElementById("editObservacoes").value
    };

    const resp = await fetch(`${API}/onibus/editar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (resp.ok) {
      alert("Ônibus atualizado!");
      document.getElementById("modalEditarOnibus").style.display = "none";
      carregarOnibus();
    } else {
      alert("Erro ao atualizar");
    }
  });

  // =====================================
  // EXCLUIR
  // =====================================
  window.excluirOnibus = async (id) => {
    if (!confirm("Deseja excluir este ônibus?")) return;

    const resp = await fetch(`${API}/onibus/excluir/${id}`, { method: "DELETE" });

    if (resp.ok) {
      alert("Ônibus excluído!");
      carregarOnibus();
    } else {
      alert("Erro ao excluir");
    }
  };

});
