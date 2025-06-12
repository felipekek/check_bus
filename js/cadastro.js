// cadastro.js
// Faz o cadastro de um novo aluno no Firebase Authentication e Firestore.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configuração do Firebase (igual dos outros arquivos)
const firebaseConfig = {
  apiKey: "AIzaSyDAG_nfsNFNk6ZnhTnC9Cci-N6L3Bui4PY",
  authDomain: "trancaeletronica-90835.firebaseapp.com",
  projectId: "trancaeletronica-90835",
  storageBucket: "trancaeletronica-90835.appspot.com",
  messagingSenderId: "566150115221",
  appId: "1:566150115221:web:1c6eaf30767894dbfd909c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Aguarda o DOM carregar para adicionar o listener do formulário
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const message = document.getElementById('message');

  // Ao enviar o formulário, cria usuário e salva dados no Firestore
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const instituicao = document.getElementById('instituicao').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      // Salva dados do aluno na coleção "alunos"
      await setDoc(doc(db, "alunos", uid), {
        nome,
        cpf,
        instituicao,
        email
      });

      message.style.color = 'green';
      message.textContent = "Aluno cadastrado com sucesso!";
      form.reset();
    } catch (error) {
      console.error("Erro:", error);
      message.style.color = 'red';
      message.textContent = "Erro: " + error.message;
    }
  });
});