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
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


/* ===========================================================
   PEGAR TURNOS MARCADOS
=========================================================== */
function getTurnos() {
  const checks = document.querySelectorAll(".turno-check:checked");
  const values = Array.from(checks).map(c => c.value);
  return values.length ? values : ["todos"];
}


/* ===========================================================
   ENVIAR AVISO (UM PARA CADA TURNO)
=========================================================== */
async function enviarAviso(titulo, mensagem, turnos) {
  for (let t of turnos) {
    await addDoc(collection(db, "avisos"), {
      titulo,
      mensagem,
      turno: t,
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
   ENVIAR AVISOS PRÉ-PROGRAMADOS
=========================================================== */
document.getElementById("btnEnviarPredef").addEventListener("click", () => {
  const checks = document.querySelectorAll(".predef-check:checked");
  const turnos = getTurnos();

  if (!checks.length) {
    alert("Selecione pelo menos um aviso pré-programado.");
    return;
  }

  checks.forEach(c => {
    const titulo = c.nextSibling.textContent.trim();
    const mensagem = c.dataset.msg;
    enviarAviso(titulo, mensagem, turnos);
  });

  alert("Avisos enviados!");
});


/* ===========================================================
   GERAR HTML DO AVISO COM ACCORDION
=========================================================== */
function gerarLinhaHTML(aviso, id) {
  const dataFormatada = aviso.dataEnvio?.toDate()
    ? aviso.dataEnvio.toDate().toLocaleString("pt-BR")
    : "—";

  return `
    <!-- Linha visível -->
    <tr class="avisos-row">
      <td>${aviso.titulo}</td>
      <td>${aviso.turno.toUpperCase()}</td>
      <td>${dataFormatada}</td>
      <td>
        <button class="btn-delete" data-id="${id}">Excluir</button>
      </td>
    </tr>

    <!-- Accordion oculto -->
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
   LISTAR AVISOS EM TEMPO REAL
=========================================================== */
const tbody = document.getElementById("listaAvisos");

onSnapshot(collection(db, "avisos"), snap => {
  tbody.innerHTML = "";

  snap.forEach(docSnap => {
    const aviso = docSnap.data();
    const id = docSnap.id;

    tbody.innerHTML += gerarLinhaHTML(aviso, id);
  });

  /* --- Excluir Aviso --- */
  document.querySelectorAll(".btn-delete").forEach(botao => {
    botao.addEventListener("click", async () => {
      if (confirm("Tem certeza que deseja excluir este aviso?")) {
        await deleteDoc(doc(db, "avisos", botao.dataset.id));
      }
    });
  });
});


/* ===========================================================
   ABRIR / FECHAR ACCORDION
=========================================================== */
document.addEventListener("click", (e) => {
  const linha = e.target.closest(".avisos-row");
  if (!linha) return;

  const accordion = linha.nextElementSibling;
  if (accordion.classList.contains("accordion-row")) {
    accordion.classList.toggle("open");
  }
});


/* ===========================================================
   PESQUISA NA TABELA
=========================================================== */
const campoPesquisa = document.getElementById("pesquisarAvisos");

if (campoPesquisa) {
  campoPesquisa.addEventListener("input", () => {
    const termo = campoPesquisa.value.toLowerCase();
    const linhas = document.querySelectorAll("#listaAvisos tr.avisos-row");

    linhas.forEach(linha => {
      const texto = linha.innerText.toLowerCase();
      const accordion = linha.nextElementSibling;

      const mostrar = texto.includes(termo);
      linha.style.display = mostrar ? "" : "none";
      accordion.style.display = mostrar ? "" : "none";
    });
  });
}
