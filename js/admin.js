// admin.js
// Página de administração: lista, exibe e exclui alunos e seus horários. Só acessível para staff.

import { db, auth } from "./firebase-config.js";
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const STAFF_EMAIL = "staff@adm.com";

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
        corpo.innerHTML = "";
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
            let ultimoLogin = aluno.ultimoLogin || "-";
            corpo.innerHTML += `
                <tr>
                    <td>${aluno.nome || "-"}</td>
                    <td>${aluno.email || "-"}</td>
                    <td>${aluno.instituicao || "-"}</td>
                    <td>${ultimoLogin}</td>
                    <td>${horarios.length > 0 ? horarios.join("<br>") : "-"}</td>
                    <td><button class="delete-btn" data-id="${alunoId}">Excluir</button></td>
                </tr>
            `;
        }
        // Adiciona evento de exclusão para cada botão
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const alunoIdParaExcluir = event.target.dataset.id;
                excluirAluno(alunoIdParaExcluir);
            });
        });

    } catch (err) {
        console.error("Erro ao carregar alunos:", err);
        corpo.innerHTML = `<tr><td colspan="6" class="no-data">Erro ao carregar alunos. Verifique o console.</td></tr>`;
    }
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