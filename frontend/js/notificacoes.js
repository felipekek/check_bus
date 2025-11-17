import { db, auth } from "./firebase-config.js";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

/* ================================
   ELEMENTOS DA PÁGINA
================================ */
const listaAvisosAluno = document.getElementById("listaAvisosAluno");
const msgSemAvisos = document.getElementById("msgSemAvisos");
const campoBusca = document.getElementById("buscaAvisosAluno");
const badgeTurno = document.getElementById("badgeTurno");

// painel do ônibus (por enquanto estático / futuro GPS)
const statusOnibusMensagem = document.getElementById("statusOnibusMensagem");
const tempoEstimadoSpan = document.getElementById("tempoEstimado");
const distanciaSpan = document.getElementById("distanciaAproximada");

let turnoAluno = null;
let avisosCarregados = [];

/* ================================
   OBTÉM TURNO DO ALUNO LOGADO
================================ */
function normalizeTurno(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // se quiser, redireciona para login
    console.warn("Usuário não logado.");
    return;
  }

  try {
    const alunoRef = doc(db, "alunos", user.uid);
    const alunoSnap = await getDoc(alunoRef);

    if (!alunoSnap.exists()) {
      console.warn("Documento de aluno não encontrado.");
      badgeTurno.textContent = "Turno: não definido";
      return;
    }

    const dados = alunoSnap.data();
    turnoAluno = normalizeTurno(dados.turno || 'todos');
    badgeTurno.textContent = `Turno: ${turnoAluno.toUpperCase()}`;

    // Agora que temos o turno, podemos ouvir a coleção de avisos
    escutarAvisos();
    prepararPainelOnibus(); // placeholder - futuro GPS

  } catch (err) {
    console.error("Erro ao carregar turno do aluno:", err);
  }
});

/* ================================
   ESCUTA AVISOS DO FIRESTORE
================================ */
function escutarAvisos() {
  const avisosRef = collection(db, "avisos");
  const q = query(avisosRef, orderBy("dataEnvio", "desc"));

  onSnapshot(q, (snapshot) => {
    avisosCarregados = [];
    listaAvisosAluno.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const dados = docSnap.data();
      const id = docSnap.id;

      const avisoTurnoNorm = normalizeTurno(dados.turno || 'todos');
      if (avisoTurnoNorm === 'todos' || avisoTurnoNorm === turnoAluno) {
        avisosCarregados.push({ id, ...dados });
      }
    });

    renderizarAvisos(avisosCarregados);
  });
}

/* ================================
   RENDERIZA CARDS DE AVISOS
================================ */
function renderizarAvisos(lista) {
  listaAvisosAluno.innerHTML = "";

  if (!lista.length) {
    msgSemAvisos.style.display = "block";
    return;
  } else {
    msgSemAvisos.style.display = "none";
  }

  lista.forEach((aviso) => {
    const dataFormatada = aviso.dataEnvio?.toDate
      ? aviso.dataEnvio.toDate().toLocaleString("pt-BR")
      : "—";

    const card = document.createElement("div");
    card.classList.add("aviso-card");

    card.innerHTML = `
      <div class="aviso-header">
        <h3 class="aviso-titulo">${aviso.titulo}</h3>
        <span class="aviso-data">${dataFormatada}</span>
      </div>
      <p class="aviso-mensagem">${aviso.mensagem}</p>
      <span class="aviso-turno-tag">${aviso.turno.toUpperCase()}</span>
    `;

    listaAvisosAluno.appendChild(card);
  });
}

/* ================================
   PESQUISA LOCAL NA LISTA
================================ */
if (campoBusca) {
  campoBusca.addEventListener("input", () => {
    const termo = campoBusca.value.toLowerCase();

    const filtrados = avisosCarregados.filter((aviso) => {
      const texto =
        `${aviso.titulo} ${aviso.mensagem} ${aviso.turno}`.toLowerCase();
      return texto.includes(termo);
    });

    renderizarAvisos(filtrados);
  });
}

/* ================================
   PAINEL DO ÔNIBUS (PLACEHOLDER)
   – Aqui depois vamos integrar com GPS
================================ */
function prepararPainelOnibus() {
  // Por enquanto, só deixamos um texto informativo.
  // Quando integrar o GPS, você pode trocar estes valores
  // em tempo real via Firestore ou via backend.

  statusOnibusMensagem.textContent =
    "Assim que o ônibus do seu turno estiver a caminho, as notificações aparecerão aqui.";

  tempoEstimadoSpan.textContent = "--";
  distanciaSpan.textContent = "--";
}
