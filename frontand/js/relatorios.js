// relatorios.js
// Este arquivo controla a página de relatórios de acessos (admin).
// Permite listar e excluir registros de acessos do Firestore.

import { db, auth } from "./firebase-config.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const STAFF_EMAIL = "staff@adm.com";

// Verifica se o usuário é staff e carrega relatórios
onAuthStateChanged(auth, async (user) => {
    // Esconde botões se não for staff
    const btnRelatorio = document.getElementById("btnRelatorio");
    const btnAlunos = document.getElementById("btnAlunos");

    if (!user || user.email !== STAFF_EMAIL) {
        if (btnRelatorio) btnRelatorio.style.display = "none";
        if (btnAlunos) btnAlunos.style.display = "none";
        window.location.href = "home.html";
        return;
    }

    carregarRelatorios();
});

// Busca e exibe todos os registros de acesso
async function carregarRelatorios() {
    const listaDiv = document.getElementById("lista");
    listaDiv.innerHTML = `<div class="no-data">Carregando registros...</div>`;

    try {
        const q = collection(db, "acessos");
        const acessosSnap = await getDocs(q);

        if (acessosSnap.empty) {
            listaDiv.innerHTML = `<div class="no-data">Nenhum registro de acesso encontrado.</div>`;
            return;
        }

        listaDiv.innerHTML = "";

        // Para cada acesso, cria um item na lista
        for (const acessoDoc of acessosSnap.docs) {
            const acesso = acessoDoc.data();
            const acessoId = acessoDoc.id;
            const uid = acesso.uid || "UID Desconhecido";
            const data = acesso.data || "Data Desconhecida";
            const horario = acesso.horario || "Hora Desconhecida";

            const div = document.createElement("div");
            div.innerHTML = `
    <span>UID: ${uid} | Data: ${data} | Horário: ${horario}</span>
    <button class="delete-btn" data-id="${acessoId}">
    <i class="fa-solid fa-trash"></i>
    </button>
`;
            listaDiv.appendChild(div);
        }

        // Adiciona evento de exclusão para cada botão
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.onclick = async function () {
                if (confirm("Deseja realmente excluir este registro?")) {
                    await excluirRelatorio(btn.getAttribute("data-id"));
                }
            };
        });

    } catch (error) {
        listaDiv.innerHTML = `<div class="no-data">Erro ao carregar registros.</div>`;
    }
}

// Exclui um registro de acesso pelo ID
async function excluirRelatorio(id) {
    try {
        await deleteDoc(doc(db, "acessos", id));
        carregarRelatorios();
    } catch (error) {
        alert("Erro ao excluir registro.");
    }
}

// Faz logout do usuário
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

