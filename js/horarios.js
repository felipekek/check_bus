// horarios.js

import { db, auth } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

let userId = null;

// Verifica se está logado
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userId = user.uid;
    await carregarHorario();
  } else {
    window.location.href = "index.html";
  }
});

// Salvar horário
window.salvarHorario = async () => {
  const horario = document.getElementById("horario").value;
  const msg = document.getElementById("msg");

  if (!horario) {
    msg.textContent = "Digite um horário válido.";
    return;
  }

  try {
    await setDoc(doc(db, "horarios", userId), { horario });
    msg.textContent = "Horário salvo com sucesso!";
  } catch (error) {
    msg.textContent = "Erro ao salvar horário.";
    console.error(error);
  }
};

// Carregar horário salvo (opcional)
async function carregarHorario() {
  const docRef = doc(db, "horarios", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById("horario").value = data.horario || "";
  }
}
