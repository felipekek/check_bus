// horarios.js
// Permite ao usuário cadastrar, editar e excluir horários no Firestore.

import { db, auth } from "./firebase-config.js";
import { collection, doc, setDoc, deleteDoc, getDocs, addDoc, getDoc, query } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const STAFF_EMAIL = "staff@adm.com";
let userId = null;
let horarioEditandoId = null;

// Controle de acesso e carregamento dos horários
onAuthStateChanged(auth, async (user) => {
  const btnRelatorio = document.getElementById("btnRelatorio");
  const btnAlunos = document.getElementById("btnAlunos");

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Esconde botões de admin para usuários comuns
  if (user.email !== STAFF_EMAIL) {
    if (btnRelatorio) btnRelatorio.style.display = "none";
    if (btnAlunos) btnAlunos.style.display = "none";
  }

  userId = user.uid;
  carregarHorarios();
});

// Salva ou edita horário
window.salvarHorario = async () => {
  const titulo = document.getElementById("titulo").value;
  const hora = document.getElementById("hora").value;
  const minuto = document.getElementById("minuto").value;
  const msg = document.getElementById("msg");

  if (!titulo || !hora || !minuto || !userId || hora < 0 || hora > 23 || minuto < 0 || minuto > 59) {
    msg.textContent = "Por favor, insira um título e horário válidos.";
    return;
  }

  const horario = `${hora.padStart(2, '0')}:${minuto.padStart(2, '0')}`;
  const horarioData = { titulo, horario };

  try {
    const horariosRef = collection(db, "horarios", userId, "listaHorarios");
    if (horarioEditandoId) {
      // Edita horário existente
      const docRef = doc(db, "horarios", userId, "listaHorarios", horarioEditandoId);
      await setDoc(docRef, horarioData, { merge: true });
      horarioEditandoId = null;
      msg.textContent = "Horário editado com sucesso!";
    } else {
      // Adiciona novo horário
      await addDoc(horariosRef, horarioData);
      msg.textContent = "Horário salvo com sucesso!";
    }
    document.getElementById("titulo").value = "";
    document.getElementById("hora").value = "";
    document.getElementById("minuto").value = "";
    carregarHorarios();
  } catch (err) {
    msg.textContent = "Erro ao salvar horário.";
  }
};

// Carrega horários do usuário
async function carregarHorarios() {
  const horariosRef = collection(db, "horarios", userId, "listaHorarios");
  const q = query(horariosRef);

  try {
    const querySnapshot = await getDocs(q);
    const listaHorarios = document.getElementById("listaHorarios");
    listaHorarios.innerHTML = "";

    querySnapshot.forEach((docItem) => {
      const data = docItem.data();
      const { titulo, horario } = data;

      const li = document.createElement("li");
      li.className = "horario-item";
      li.innerHTML = `
        <span><strong>${titulo}</strong>: ${horario}</span>
        <span class="botoes">
          <button class="edit" onclick="editarHorario('${docItem.id}')">Editar</button>
          <button onclick="excluirHorario('${docItem.id}')">Excluir</button>
        </span>
      `;
      listaHorarios.appendChild(li);
    });
  } catch (err) {
    document.getElementById("msg").textContent = "Erro ao carregar os horários.";
  }
}

// Preenche formulário para editar horário
window.editarHorario = async (id) => {
  const horariosRef = doc(db, "horarios", userId, "listaHorarios", id);
  const docSnapshot = await getDoc(horariosRef);

  if (docSnapshot.exists()) {
    const data = docSnapshot.data();
    const { titulo, horario } = data;

    document.getElementById("titulo").value = titulo;
    const [hora, minuto] = horario.split(":");
    document.getElementById("hora").value = hora;
    document.getElementById("minuto").value = minuto;

    horarioEditandoId = id;
    document.getElementById("msg").textContent = "Editando horário. Salve para atualizar.";
  }
};

// Exclui horário
window.excluirHorario = async (id) => {
  try {
    const horariosRef = doc(db, "horarios", userId, "listaHorarios", id);
    await deleteDoc(horariosRef);
    carregarHorarios();
  } catch (err) {
    document.getElementById("msg").textContent = "Erro ao excluir o horário.";
  }
};

// Logout
window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
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
