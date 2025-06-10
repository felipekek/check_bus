// Arquivo: ../js/relatorios.js

import { db, auth } from "./firebase-config.js";
// Importe 'deleteDoc' e 'doc' para poder deletar documentos
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const STAFF_EMAIL = "staff@adm.com";

// Função para carregar e exibir os relatórios
async function carregarRelatorios() {
    const listaDiv = document.getElementById("lista");
    listaDiv.innerHTML = `<div class="no-data">Carregando registros...</div>`;

    try {
        // Opcional: Você pode ordenar os relatórios para que os mais recentes apareçam primeiro
        // const q = query(collection(db, "acessos"), orderBy("data", "desc"), orderBy("horario", "desc"));
        const q = collection(db, "acessos"); // Se não quiser ordenar por enquanto, use assim

        const acessosSnap = await getDocs(q);

        if (acessosSnap.empty) {
            listaDiv.innerHTML = `<div class="no-data">Nenhum registro de acesso encontrado.</div>`;
            return;
        }

        listaDiv.innerHTML = ""; // Limpa o conteúdo antes de adicionar novos itens

        for (const acessoDoc of acessosSnap.docs) {
            const acesso = acessoDoc.data();
            const acessoId = acessoDoc.id; // **Pegar o ID do documento é crucial para a exclusão!**

            const uid = acesso.uid || "UID Desconhecido";
            const data = acesso.data || "Data Desconhecida";
            const horario = acesso.horario || "Hora Desconhecida";

            listaDiv.innerHTML += `
                <div>
                    <span>UID: ${uid} | Data: ${data} | Horário: ${horario}</span>
                    <button class="delete-btn" data-id="${acessoId}">Excluir</button>
                </div>
            `;
        }

        // **Adiciona os event listeners para os botões de excluir após todos serem criados**
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const acessoIdParaExcluir = event.target.dataset.id; // Pega o ID do atributo 'data-id'
                excluirAcesso(acessoIdParaExcluir);
            });
        });

    } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
        listaDiv.innerHTML = `<div class="no-data">Erro ao carregar relatórios. Verifique o console.</div>`;
    }
}

// **Nova função para excluir um registro de acesso**
async function excluirAcesso(acessoId) {
    if (confirm("Tem certeza que deseja excluir este registro de acesso?")) {
        try {
            await deleteDoc(doc(db, "acessos", acessoId)); // Deleta o documento no Firestore
            console.log(`Registro de acesso ${acessoId} excluído com sucesso!`);
            alert("Registro de acesso excluído com sucesso!");
            carregarRelatorios(); // Recarrega a lista para remover o item excluído da tela
        } catch (error) {
            console.error("Erro ao excluir registro de acesso:", error);
            alert("Erro ao excluir registro: " + error.message);
        }
    }
}

// Verifica o status de autenticação e carrega os relatórios apenas se for staff
onAuthStateChanged(auth, (user) => {
    if (user && user.email === STAFF_EMAIL) {
        carregarRelatorios(); // Chama a função para carregar relatórios se for staff
    } else {
        // Se não for staff, exibe uma mensagem ou redireciona
        const relatorioContainer = document.querySelector('.relatorio-container');
        if (relatorioContainer) {
            relatorioContainer.innerHTML = '<div class="no-data">Acesso negado. Apenas administradores podem ver relatórios.</div>';
        }
        // Se você já tem um redirecionamento no HTML para 'home.html' em caso de não ser staff,
        // pode deixar essa parte do JS para apenas mostrar a mensagem de acesso negado.
    }
});

// Se você precisar exportar a função para outros módulos, adicione aqui (neste caso, não é essencial)
// export { carregarRelatorios };