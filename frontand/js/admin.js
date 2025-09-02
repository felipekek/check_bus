// admin.js
// Página de administração: lista, exibe e exclui alunos e seus horários. Só acessível para staff.

import { db, auth } from "./firebase-config.js";
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const STAFF_EMAIL = "staff@adm.com";
let listaAlunos = []; // <- guarda todos os alunos carregados

// Verifica se é staff e carrega alunos
onAuthStateChanged(auth, async (user) => {
    const btnRelatorio = document.getElementById("btnRelatorio");
    const btnAlunos = document.getElementById("btnAlunos");

    if (!user || user.email !== STAFF_EMAIL) {
        if (btnRelatorio) btnRelatorio.style.display = "none";
        if (btnAlunos) btnAlunos.style.display = "none";
        window.location.href = "home.html";
    } else {
        carregarAlunos();
    }
});

// Busca e exibe todos os alunos cadastrados
async function carregarAlunos() {
    const corpo = document.getElementById("corpoTabelaAlunos");
    corpo.innerHTML = `<tr><td colspan="6" class="no-data">Carregando alunos...</td></tr>`;
    try {
        const alunosSnap = await getDocs(collection(db, "alunos"));
        if (alunosSnap.empty) {
            corpo.innerHTML = `<tr><td colspan="6" class="no-data">Nenhum aluno cadastrado.</td></tr>`;
            return;
        }

        listaAlunos = []; // limpa para recarregar
        for (const alunoDoc of alunosSnap.docs) {
            const aluno = alunoDoc.data();
            const alunoId = alunoDoc.id;

            // Busca horários do aluno
            const horariosSnap = await getDocs(collection(db, "horarios", alunoId, "listaHorarios"));
            let horarios = [];
            horariosSnap.forEach(h => {
                const d = h.data();
                horarios.push(`${d.titulo || ""} ${d.horario || ""}`.trim());
            });

            listaAlunos.push({
                id: alunoId,
                nome: aluno.nome || "-",
                email: aluno.email || "-",
                instituicao: aluno.instituicao || "-",
                ultimoLogin: aluno.ultimoLogin || "-",
                horarios: horarios.length > 0 ? horarios.join("<br>") : "-"
            });
        }

        renderizarAlunos(listaAlunos);

    } catch (err) {
        console.error("Erro ao carregar alunos:", err);
        corpo.innerHTML = `<tr><td colspan="6" class="no-data">Erro ao carregar alunos. Verifique o console.</td></tr>`;
    }
}

// Renderiza os alunos no corpo da tabela
function renderizarAlunos(alunos) {
    const corpo = document.getElementById("corpoTabelaAlunos");
    corpo.innerHTML = "";

    if (alunos.length === 0) {
        corpo.innerHTML = `<tr><td colspan="6" class="no-data">Nenhum aluno encontrado.</td></tr>`;
        return;
    }

    for (const aluno of alunos) {
        corpo.innerHTML += `
            <tr>
                <td>${aluno.nome}</td>
                <td>${aluno.email}</td>
                <td>${aluno.instituicao}</td>
                <td>${aluno.ultimoLogin}</td>
                <td>${aluno.horarios}</td>
                <td>
                  <button class="delete-btn" data-id="${aluno.id}" title="Excluir">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0,0,256,256">
                      <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
                        <g transform="scale(9.84615,9.84615)">
                          <path d="M11,-0.03125c-0.83594,0 -1.65625,0.16406 -2.25,0.75c-0.59375,0.58594 -0.78125,1.41797 -0.78125,2.28125h-3.96875c-0.55078,0 -1,0.44922 -1,1h-1v2h22v-2h-1c0,-0.55078 -0.44922,-1 -1,-1h-3.96875c0,-0.86328 -0.1875,-1.69531 -0.78125,-2.28125c-0.59375,-0.58594 -1.41406,-0.75 -2.25,-0.75zM11,2.03125h4c0.54688,0 0.71875,0.12891 0.78125,0.1875c0.0625,0.05859 0.1875,0.22266 0.1875,0.78125h-5.9375c0,-0.55859 0.125,-0.72266 0.1875,-0.78125c0.0625,-0.05859 0.23438,-0.1875 0.78125,-0.1875zM4,7v16c0,1.65234 1.34766,3 3,3h12c1.65234,0 3,-1.34766 3,-3v-16zM8,10h2v12h-2zM12,10h2v12h-2zM16,10h2v12h-2z"></path>
                        </g>
                      </g>
                    </svg>
                  </button>
                </td>
            </tr>
        `;
    }

    // Adiciona evento de exclusão
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const alunoIdParaExcluir = event.currentTarget.dataset.id;
            excluirAluno(alunoIdParaExcluir);
        });
    });
}

// Exclui aluno e todos os seus horários
async function excluirAluno(alunoId) {
    if (confirm("Tem certeza que deseja excluir este aluno e todos os seus horários registrados?")) {
        try {
            // Exclui subcoleção de horários
            const horariosParaExcluirSnap = await getDocs(collection(db, "horarios", alunoId, "listaHorarios"));
            const deletePromises = [];
            horariosParaExcluirSnap.forEach(hDoc => {
                deletePromises.push(deleteDoc(doc(db, "horarios", alunoId, "listaHorarios", hDoc.id)));
            });
            await Promise.all(deletePromises);

            // Exclui o documento do aluno
            await deleteDoc(doc(db, "alunos", alunoId));
            alert("Aluno excluído com sucesso!");
            carregarAlunos();
        } catch (error) {
            console.error("Erro ao excluir aluno:", error);
            alert("Erro ao excluir aluno: " + error.message);
        }
    }
}

// Filtro da barra de pesquisa
document.getElementById("barraPesquisa").addEventListener("keyup", (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = listaAlunos.filter(aluno => 
        aluno.nome.toLowerCase().includes(termo) ||
        aluno.email.toLowerCase().includes(termo) ||
        aluno.instituicao.toLowerCase().includes(termo) ||
        aluno.ultimoLogin.toLowerCase().includes(termo) ||
        aluno.horarios.toLowerCase().includes(termo)
    );
    renderizarAlunos(filtrados);
});

// Logout do admin
window.logout = () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        alert("Erro ao fazer logout.");
    });
};

// Abre/fecha o menu lateral
window.toggleMenu = () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const menuBtn = document.querySelector(".menu-btn");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    menuBtn.classList.toggle("hidden");
};
