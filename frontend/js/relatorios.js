// frontend/js/relatorios.js
const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Controle de acesso
if (!token || tipoUsuario !== "admin") {
  window.location.href = "index.html";
}

async function carregarRelatorios() {
  const listaDiv = document.getElementById("lista");
  listaDiv.innerHTML = `<div class="no-data">Carregando registros...</div>`;

  try {
    const res = await fetch("/relatorios", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Erro ao buscar relatórios");

    const registros = await res.json();

    if (registros.length === 0) {
      listaDiv.innerHTML = `<div class="no-data">Nenhum registro encontrado.</div>`;
      return;
    }

    listaDiv.innerHTML = "";

    registros.forEach(reg => {
      const div = document.createElement("div");
      div.classList.add("item-relatorio");
      div.innerHTML = `
        <span>UID: ${reg.uid} | Data: ${reg.data} | Horário: ${reg.horario}</span>
        <button class="delete-btn" data-id="${reg.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0,0,256,256">
                    <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
                        <g transform="scale(9.84615,9.84615)">
                            <path d="M11,-0.03125c-0.83594,0 -1.65625,0.16406 -2.25,0.75c-0.59375,0.58594 -0.78125,1.41797 -0.78125,2.28125h-3.96875c-0.55078,0 -1,0.44922 -1,1h-1v2h22v-2h-1c0,-0.55078 -0.44922,-1 -1,-1h-3.96875c0,-0.86328 -0.1875,-1.69531 -0.78125,-2.28125c-0.59375,-0.58594 -1.41406,-0.75 -2.25,-0.75zM11,2.03125h4c0.54688,0 0.71875,0.12891 0.78125,0.1875c0.0625,0.05859 0.1875,0.22266 0.1875,0.78125h-5.9375c0,-0.55859 0.125,-0.72266 0.1875,-0.78125c0.0625,-0.05859 0.23438,-0.1875 0.78125,-0.1875zM4,7v16c0,1.65234 1.34766,3 3,3h12c1.65234,0 3,-1.34766 3,-3v-16zM8,10h2v12h-2zM12,10h2v12h-2zM16,10h2v12h-2z"></path>
                        </g>
                     </g>
                </svg>
        </button>
      `;
      listaDiv.appendChild(div);
    });

    // Botões de exclusão
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        if (confirm("Deseja realmente excluir este registro?")) {
          await excluirRelatorio(btn.dataset.id);
        }
      };
    });
  } catch (err) {
    console.error("Erro ao carregar relatórios:", err);
    listaDiv.innerHTML = `<div class="no-data">Erro ao carregar registros.</div>`;
  }
}

async function excluirRelatorio(id) {
  try {
    const res = await fetch(`/relatorios/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Erro ao excluir");
    carregarRelatorios();
  } catch (err) {
    alert("Erro ao excluir registro.");
  }
}

// Logout
window.logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tipoUsuario");
  window.location.href = "index.html";
};

// Menu lateral
window.toggleMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.querySelector(".menu-btn");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuBtn.classList.toggle("hidden");
};

// Inicializa
carregarRelatorios();
