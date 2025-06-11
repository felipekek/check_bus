//admin.js

// Importa a função deleteDoc do Firebase Firestore
        import { db, auth } from "./firebase-config.js";
        import { collection, getDocs, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
        import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

        const STAFF_EMAIL = "staff@adm.com";

        onAuthStateChanged(auth, async (user) => {
            const btnRelatorio = document.getElementById("btnRelatorio");
            const btnAlunos = document.getElementById("btnAlunos");

            if (!user || user.email !== STAFF_EMAIL) {
                if (btnRelatorio) btnRelatorio.style.display = "none";
                if (btnAlunos) btnAlunos.style.display = "none";
                // Redireciona se não for staff
                window.location.href = "home.html"; // ou outra página de erro/acesso negado
            } else {
                carregarAlunos(); // Carrega alunos apenas se for staff
            }
        });

        async function carregarAlunos() {
            const corpo = document.getElementById("corpoTabelaAlunos");
            corpo.innerHTML = `<tr><td colspan="6" class="no-data">Carregando alunos...</td></tr>`; // colspan ajustado
            try {
                const alunosSnap = await getDocs(collection(db, "alunos"));
                if (alunosSnap.empty) {
                    corpo.innerHTML = `<tr><td colspan="6" class="no-data">Nenhum aluno cadastrado.</td></tr>`; // colspan ajustado
                    return;
                }
                corpo.innerHTML = "";
                for (const alunoDoc of alunosSnap.docs) {
                    const aluno = alunoDoc.data();
                    // Obtenha o ID do documento do aluno
                    const alunoId = alunoDoc.id;

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
                            <td><button class="delete-btn" data-id="${alunoId}">Excluir</button></td> </tr>
                    `;
                }
                // Adiciona os event listeners para os botões de excluir
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const alunoIdParaExcluir = event.target.dataset.id;
                        excluirAluno(alunoIdParaExcluir);
                    });
                });

            } catch (err) {
                console.error("Erro ao carregar alunos:", err);
                corpo.innerHTML = `<tr><td colspan="6" class="no-data">Erro ao carregar alunos. Verifique o console.</td></tr>`; // colspan ajustado
            }
        }

        // Nova função para excluir aluno
        async function excluirAluno(alunoId) {
            if (confirm("Tem certeza que deseja excluir este aluno e todos os seus horários registrados?")) {
                try {
                    // 1. Excluir subcoleção 'listaHorarios'
                    const horariosParaExcluirSnap = await getDocs(collection(db, "horarios", alunoId, "listaHorarios"));
                    const deletePromises = [];
                    horariosParaExcluirSnap.forEach(hDoc => {
                        deletePromises.push(deleteDoc(doc(db, "horarios", alunoId, "listaHorarios", hDoc.id)));
                    });
                    await Promise.all(deletePromises);
                    console.log(`Subcoleção 'listaHorarios' do aluno ${alunoId} excluída.`);

                    // 2. Excluir o documento do aluno na coleção 'alunos'
                    await deleteDoc(doc(db, "alunos", alunoId));
                    console.log(`Documento do aluno ${alunoId} excluído com sucesso!`);
                    alert("Aluno excluído com sucesso!");
                    carregarAlunos(); // Recarrega a lista após a exclusão
                } catch (error) {
                    console.error("Erro ao excluir aluno:", error);
                    alert("Erro ao excluir aluno: " + error.message);
                }
            }
        }

        window.logout = () => {
            signOut(auth).then(() => {
                window.location.href = "index.html";
            }).catch((error) => {
                console.error("Erro ao fazer logout:", error);
                alert("Erro ao fazer logout.");
            });
        };

        window.toggleMenu = () => {
            const sidebar = document.getElementById("sidebar");
            const overlay = document.getElementById("overlay");
            const menuBtn = document.querySelector(".menu-btn");

            sidebar.classList.toggle("active");
            overlay.classList.toggle("active");
            menuBtn.classList.toggle("hidden");
        };