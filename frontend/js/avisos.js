/* ===========================================================
   IMPORTS FIREBASE
=========================================================== */
import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


/* ===========================================================
   ORDEM FIXA DOS TURNOS
=========================================================== */
const ORDEM_TURNOS = {
  manha: 1,
  tarde: 2,
  noite: 3,
  todos: 4
};


/* ===========================================================
   PEGAR TURNOS MARCADOS (ORDENADOS)
=========================================================== */
function getTurnos() {
  const checks = document.querySelectorAll(".turno-check:checked");
  const values = Array.from(checks).map(c => c.value);
  const turnos = values.length ? values : ["todos"];

  return turnos.sort((a, b) => ORDEM_TURNOS[a] - ORDEM_TURNOS[b]);
}


function normalizeTurno(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}


/* ===========================================================
   ENVIAR AVISO
=========================================================== */
async function enviarAviso(titulo, mensagem, turnos) {
  for (let t of turnos) {
    await addDoc(collection(db, "avisos"), {
      titulo,
      mensagem,
      turno: normalizeTurno(t),
      tipo: "personalizado",
      dataEnvio: serverTimestamp()
    });
  }
}


/* ===========================================================
   FORMULÁRIO - AVISO PERSONALIZADO
=========================================================== */
document.getElementById("formAviso").addEventListener("submit", e => {
  e.preventDefault();

  const titulo = document.getElementById("tituloAviso").value.trim();
  const mensagem = document.getElementById("mensagemAviso").value.trim();
  const turnos = getTurnos();

  if (!titulo || !mensagem) {
    alert("Preencha todos os campos!");
    return;
  }

  enviarAviso(titulo, mensagem, turnos);
  e.target.reset();
});


/* ===========================================================
   AVISOS PRÉ-PROGRAMADOS
=========================================================== */
document.getElementById("btnEnviarPredef").addEventListener("click", () => {
  const checks = document.querySelectorAll(".predef-check:checked");
  const turnos = getTurnos();

  if (!checks.length) {
    alert("Selecione pelo menos um aviso pré-programado.");
    return;
  }

  checks.forEach(c => {
    const titulo = c.closest("label").querySelector("span").textContent.trim();
    const mensagem = c.dataset.msg;
    enviarAviso(titulo, mensagem, turnos);
  });

  alert("Avisos enviados!");
});


/* ===========================================================
   GERAR HTML DO AVISO
=========================================================== */
function gerarLinhaHTML(aviso, id) {
  const dataFormatada = aviso.dataEnvio?.toDate()
    ? aviso.dataEnvio.toDate().toLocaleString("pt-BR")
    : "—";

  return `
    <tr class="avisos-row">
      <td>${aviso.titulo}</td>
      <td>${aviso.turno.toUpperCase()}</td>
      <td>${dataFormatada}</td>
      <td>
        <button class="btn-delete" data-id="${id}">Excluir</button>
      </td>
    </tr>

    <tr class="accordion-row">
      <td colspan="4">
        <div class="accordion-content">
          <h4>${aviso.titulo}</h4>
          <p><strong>Mensagem:</strong><br>${aviso.mensagem}</p>
        </div>
      </td>
    </tr>
  `;
}


/* ===========================================================
   LISTAR AVISOS (MAIS RECENTE NO TOPO)
=========================================================== */
const tbody = document.getElementById("listaAvisos");

const avisosQuery = query(
  collection(db, "avisos"),
  orderBy("dataEnvio", "desc")
);

onSnapshot(avisosQuery, snap => {
  tbody.innerHTML = "";

  snap.forEach(docSnap => {
    const aviso = docSnap.data();
    const id = docSnap.id;
    tbody.innerHTML += gerarLinhaHTML(aviso, id);
  });

  document.querySelectorAll(".btn-delete").forEach(botao => {
    botao.addEventListener("click", async () => {
      if (confirm("Tem certeza que deseja excluir este aviso?")) {
        await deleteDoc(doc(db, "avisos", botao.dataset.id));
      }
    });
  });
});


/* ===========================================================
   ACCORDION
=========================================================== */
document.addEventListener("click", e => {
  const row = e.target.closest(".avisos-row");
  if (!row) return;
  row.nextElementSibling?.classList.toggle("open");
});


/* ===========================================================
   PESQUISA
=========================================================== */
const campoPesquisa = document.getElementById("pesquisarAvisos");

if (campoPesquisa) {
  campoPesquisa.addEventListener("input", () => {
    const termo = campoPesquisa.value.toLowerCase();
    document.querySelectorAll(".avisos-row").forEach(row => {
      const mostrar = row.innerText.toLowerCase().includes(termo);
      row.style.display = mostrar ? "" : "none";
      row.nextElementSibling.style.display = mostrar ? "" : "none";
    });
  });
}
