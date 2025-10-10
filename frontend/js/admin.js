// admin.js
// Página de administração: lista, exibe e exclui alunos e seus horários. Só acessível para staff.

// ---------- CONTROLE DE ACESSO ----------
const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Redireciona se não estiver logado ou não for admin
if (!token || tipoUsuario !== "admin") {
    window.location.href = "index.html";
}

let listaAlunos = []; // guarda todos os alunos carregados
let chartInstituicoes = null; // gráfico de pizza
let instituicaoSelecionada = null; // controla filtro ativo
let coresOriginais = []; // guarda cores originais

// ---------- CARREGA ALUNOS ----------
async function carregarAlunos() {
    const container = document.getElementById("accordionContainer");
    container.innerHTML = `<p class="no-data">Carregando alunos...</p>`;

    try {
        const res = await fetch("/admin", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erro ao buscar alunos");

        listaAlunos = await res.json();

        if (listaAlunos.length === 0) {
            container.innerHTML = `<p class="no-data">Nenhum aluno cadastrado.</p>`;
            atualizarGrafico([]); // limpa gráfico
            return;
        }

        renderizarAlunos(listaAlunos);
        atualizarGrafico(listaAlunos); // atualiza gráfico
    } catch (err) {
        console.error("Erro ao carregar alunos:", err);
        container.innerHTML = `<p class="no-data">Erro ao carregar alunos. Verifique o console.</p>`;
    }
}

// ---------- RENDERIZA ALUNOS ----------
function renderizarAlunos(alunos) {
    const container = document.getElementById("accordionContainer");
    container.innerHTML = ""; // Limpa o container

    if (alunos.length === 0) {
        container.innerHTML = `<p class="no-data">Nenhum aluno encontrado.</p>`;
        return;
    }

    alunos.forEach(aluno => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.dataset.alunoId = aluno.id;

        // Formata os horários para exibição
        const horariosFormatados = Array.isArray(aluno.horarios) && aluno.horarios.length > 0 
            ? aluno.horarios.map(h => `<tr><td>${h.dia}</td><td>${h.horario}</td></tr>`).join('')
            : '<tr><td colspan="2" class="no-data">Nenhum horário registrado.</td></tr>';

        accordionItem.innerHTML = `
            <div class="accordion-header">
                <div class="toggle-btn">&gt;</div>
                <div class="header-flex">
                    <div class="aluno-nome">${aluno.nome || 'Nome não informado'}</div>
                    <div class="summary-info">
                        <span>${aluno.instituicao || 'N/A'}</span>
                        <span>${aluno.curso || 'N/A'}</span>
                        <span>${aluno.turno || 'N/A'}</span>
                    </div>
                </div>
                <button class="delete-btn" title="Excluir" data-id="${aluno.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0,0,256,256">
            <g fill="#ffffff" fill-rule="nonzero" stroke="none">
              <g transform="scale(9.84615,9.84615)">
                <path d="M11,-0.03125c-0.83594,0 -1.65625,0.16406 -2.25,0.75c-0.59375,0.58594 -0.78125,1.41797 -0.78125,2.28125h-3.96875c-0.55078,0 -1,0.44922 -1,1h-1v2h22v-2h-1c0,-0.55078 -0.44922,-1 -1,-1h-3.96875c0,-0.86328 -0.1875,-1.69531 -0.78125,-2.28125c-0.59375,-0.58594 -1.41406,-0.75 -2.25,-0.75zM11,2.03125h4c0.54688,0 0.71875,0.12891 0.78125,0.1875c0.0625,0.05859 0.1875,0.22266 0.1875,0.78125h-5.9375c0,-0.55859 0.125,-0.72266 0.1875,-0.78125c0.0625,-0.05859 0.23438,-0.1875 0.78125,-0.1875zM4,7v16c0,1.65234 1.34766,3 3,3h12c1.65234,0 3,-1.34766 3,-3v-16zM8,10h2v12h-2zM12,10h2v12h-2zM16,10h2v12h-2z"></path>
              </g>
            </g>
          </svg>
                </button>
            </div>
            <div class="accordion-content">
                <div class="info-grid">
                    <div class="info-item"><strong>Nome:</strong> ${aluno.nome || '-'}</div>
                    <div class="info-item"><strong>Email:</strong> ${aluno.email || '-'}</div>
                    <div class="info-item"><strong>Instituição:</strong> ${aluno.instituicao || '-'}</div>
                    <div class="info-item"><strong>Curso:</strong> ${aluno.curso || '-'}</div>
                    <div class="info-item"><strong>Período:</strong> ${aluno.periodo ? aluno.periodo + 'º' : '-'}</div>
                    <div class="info-item"><strong>Turno:</strong> ${aluno.turno || '-'}</div>
                    <div class="info-item"><strong>CPF:</strong> ${aluno.cpf || '-'}</div>
                    <div class="info-item"><strong>Telefone:</strong> ${aluno.telefone || '-'}</div>
                </div>
                <div class="horarios">
                    <h3>Horários Registrados</h3>
                    <table>
                        <thead><tr><th>Dia</th><th>Horário</th></tr></thead>
                        <tbody>${horariosFormatados}</tbody>
                    </table>
                </div>
            </div>
        `;
        container.appendChild(accordionItem);
    });

    addAccordionListeners();
}

// ---------- ADICIONA EVENTOS AO ACCORDION ----------
function addAccordionListeners() {
    const container = document.getElementById("accordionContainer");

    container.addEventListener('click', (e) => {
        // Evento para excluir aluno (delegação de evento)
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            e.stopPropagation(); // Impede que o accordion abra/feche
            const alunoId = deleteButton.dataset.id;
            excluirAluno(alunoId);
            return;
        }

        // Evento para abrir/fechar o accordion
        const header = e.target.closest('.accordion-header');
        if (header) {
            const item = header.parentElement;
            item.classList.toggle('open');
        }
    });
}

// ---------- EXCLUI ALUNO ----------
async function excluirAluno(alunoId) {
    if (confirm("Tem certeza que deseja excluir este aluno e todos os seus horários registrados?")) {
        try {
            const res = await fetch(`/admin/${alunoId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Erro ao excluir aluno");

            alert("Aluno excluído com sucesso!");
            // Remove o item do DOM sem recarregar a página inteira
            const itemParaRemover = document.querySelector(`.accordion-item[data-aluno-id="${alunoId}"]`);
            if (itemParaRemover) itemParaRemover.remove();
            listaAlunos = listaAlunos.filter(a => a.id !== alunoId); // Atualiza a lista local
        } catch (error) {
            console.error("Erro ao excluir aluno:", error);
            alert("Erro ao excluir aluno: " + error.message);
        }
    }
}

// ---------- FILTRO DE PESQUISA ----------
document.getElementById("barraPesquisa").addEventListener("keyup", (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = listaAlunos.filter(aluno => 
        aluno.nome.toLowerCase().includes(termo) ||
        aluno.email.toLowerCase().includes(termo) ||
        aluno.instituicao.toLowerCase().includes(termo) ||
        (aluno.curso && aluno.curso.toLowerCase().includes(termo))
    );
    renderizarAlunos(filtrados);
});

// ---------- GRÁFICO DE INSTITUIÇÕES ----------
function atualizarGrafico(alunos) {
    const ctx = document.getElementById("instituicoesChart").getContext("2d");

    const instituicoes = {};
    alunos.forEach(a => {
        if (a.instituicao) {
            const nomeNormalizado = a.instituicao.trim().toLowerCase();
            const chave = nomeNormalizado.charAt(0).toUpperCase() + nomeNormalizado.slice(1);
            instituicoes[chave] = (instituicoes[chave] || 0) + 1;
        }
    });

    const labels = Object.keys(instituicoes);
    const data = Object.values(instituicoes);

    if (chartInstituicoes) chartInstituicoes.destroy();

    coresOriginais = labels.map((_, i) => `hsl(${i * 60 % 360}, 70%, 60%)`);

    chartInstituicoes = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                label: 'Alunos por instituição',
                data,
                backgroundColor: [...coresOriginais],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            elements: { arc: { borderWidth: 1 } },
            onClick: (evt, elements) => {
                if (!elements.length) return;
                const index = elements[0].index;
                // Pega o label da fatia clicada a partir dos dados atuais do gráfico
                const instituicaoClicada = chartInstituicoes.data.labels[index];

                if (instituicaoSelecionada === instituicaoClicada) {
                    // Se já estava filtrando por esta instituição, volta ao normal
                    instituicaoSelecionada = null;
                    renderizarAlunos(listaAlunos);

                    // Restaura os dados originais do gráfico
                    chartInstituicoes.data.labels = labels;
                    chartInstituicoes.data.datasets[0].data = data;
                    chartInstituicoes.data.datasets[0].backgroundColor = [...coresOriginais];
                } else {
                    // Ativa o filtro para a instituição clicada
                    instituicaoSelecionada = instituicaoClicada;
                    const filtrados = listaAlunos.filter(a => {
                        return a.instituicao && a.instituicao.trim().toLowerCase() === instituicaoClicada.toLowerCase();
                    });
                    renderizarAlunos(filtrados);

                    // Encontra o índice original para pegar a cor correta
                    const originalIndex = labels.indexOf(instituicaoClicada);
                    const corSelecionada = coresOriginais[originalIndex];
                    const valorSelecionado = data[originalIndex];

                    // Atualiza o gráfico para mostrar apenas a fatia selecionada
                    chartInstituicoes.data.labels = [instituicaoClicada];
                    chartInstituicoes.data.datasets[0].data = [valorSelecionado];
                    chartInstituicoes.data.datasets[0].backgroundColor = [corSelecionada];
                }

                // Anima a transição do gráfico
                chartInstituicoes.update({
                    duration: 800,
                    easing: "easeInOutCubic"
                });
            }
        }
    });
}

// ---------- LOGOUT ----------
window.logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tipoUsuario");
    window.location.href = "index.html";
};

// ---------- MENU LATERAL ----------
window.toggleMenu = () => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const menuBtn = document.querySelector(".menu-btn");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    menuBtn.classList.toggle("hidden");
};

// ---------- INICIALIZA ----------
carregarAlunos();
