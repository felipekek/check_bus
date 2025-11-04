import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  fetchSignInMethodsForEmail,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let modalCarregado = false;
let perfilIniciado = false;
let atualizarPerfilIniciado = false;
let atualizarEmailIniciado = false;

// Carrega modal de perfil
export async function carregarModalPerfil() {
  if (modalCarregado) return;
  try {
    const resposta = await fetch("../perfilModal.html"); // ajuste se necessário
    const html = await resposta.text();
    document.body.insertAdjacentHTML("beforeend", html);

    const modal = document.getElementById("modalPerfil");
    const btnFechar = document.getElementById("btnFecharPerfil");

    if (btnFechar) btnFechar.addEventListener("click", () => (modal.style.display = "none"));
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    const btnAtualizarPerfil = document.getElementById("btnAtualizarPerfil");
    const btnAlterarSenha = document.getElementById("btnAlterarSenha");
    const btnAtualizarEmail = document.getElementById("btnAtualizarEmail");
    const modalAtualizar = document.getElementById("modalAtualizarPerfil");

    if (btnAtualizarPerfil && modalAtualizar) {
      btnAtualizarPerfil.addEventListener("click", () => {
        document.getElementById("nomeAtualizar").value = document.getElementById("nomeUsuario").textContent;
        document.getElementById("telefoneAtualizar").value = document.getElementById("telefoneUsuario").textContent;
        document.getElementById("instituicaoAtualizar").value = document.getElementById("instituicaoUsuario").textContent;
        document.getElementById("cursoAtualizar").value = document.getElementById("cursoUsuario").textContent;
        document.getElementById("turnoAtualizar").value = document.getElementById("turnoUsuario").textContent;
        document.getElementById("periodoAtualizar").value = document.getElementById("periodoUsuario").textContent;
        modalAtualizar.style.display = "block";
      });
      initAtualizarPerfil();
    }

    if (!perfilIniciado && btnAlterarSenha) {
      initAlterarSenha();
      perfilIniciado = true;
    }

    if (!atualizarEmailIniciado && btnAtualizarEmail) {
      initAtualizarEmail();
      atualizarEmailIniciado = true;
    }

    modalCarregado = true;
    return true;
  } catch (err) {
    console.error("Erro ao carregar modal do perfil:", err);
    return false;
  }
}

// Abre modal principal
export async function abrirPerfil() {
  if (!modalCarregado) {
    const carregou = await carregarModalPerfil();
    if (!carregou) return;
  }

  const modal = document.getElementById("modalPerfil");
  modal.style.display = "block";
  carregarDadosUsuario();
}

// Carrega dados do usuário
async function carregarDadosUsuario() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    await syncEmailFirestoreSeMudou(user);

    const campos = { emailUsuario: user.email || "Não informado", idUsuario: user.uid };
    try {
      const userRef = doc(db, "alunos", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const dados = snap.data();
        campos.nomeUsuario = dados.nome || "Não informado";
        campos.cpfUsuario = dados.cpf || "Não informado";
        campos.instituicaoUsuario = dados.instituicao || "Não informado";
        campos.telefoneUsuario = dados.telefone || "Não informado";
        campos.cursoUsuario = dados.curso || "Não informado";
        campos.turnoUsuario = dados.turno || "Não informado";
        campos.periodoUsuario = dados.periodo || "Não informado";
      }

      for (const id in campos) {
        const el = document.getElementById(id);
        if (el) el.textContent = campos[id];
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    }
  });
}

// Sincroniza o email do Auth com o Firestore
async function syncEmailFirestoreSeMudou(user) {
  try {
    const ref = doc(db, "alunos", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const dados = snap.data() || {};
      if (dados.email !== user.email) {
        await updateDoc(ref, { email: user.email });
      }
    }
  } catch (e) {
    console.warn("Não foi possível sincronizar o e-mail no Firestore agora:", e);
  }
}

// Alterar senha
function initAlterarSenha() {
  const modalSenha = document.getElementById("modalAlterarSenha");
  const btnFecharSenha = document.getElementById("btnFecharSenha");
  const formSenha = document.getElementById("formAlterarSenha");

  document.getElementById("btnAlterarSenha").addEventListener("click", () => (modalSenha.style.display = "block"));
  btnFecharSenha.addEventListener("click", () => (modalSenha.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modalSenha) modalSenha.style.display = "none";
  });

  formSenha.addEventListener("submit", async (e) => {
    e.preventDefault();
    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmaNovaSenha = document.getElementById("confirmaNovaSenha").value;

    if (novaSenha !== confirmaNovaSenha) return alert("As senhas não coincidem!");

    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, novaSenha);
      alert("Senha alterada com sucesso!");
      modalSenha.style.display = "none";
      formSenha.reset();
    } catch (err) {
      alert("Erro ao alterar senha: " + err.message);
      console.error(err);
    }
  });
}

// Atualizar perfil
function initAtualizarPerfil() {
  if (atualizarPerfilIniciado) return;
  atualizarPerfilIniciado = true;

  const modal = document.getElementById("modalAtualizarPerfil");
  const btnFechar = document.getElementById("btnFecharAtualizarPerfil");
  const form = document.getElementById("formAtualizarPerfil");

  btnFechar.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const dados = {
      nome: document.getElementById("nomeAtualizar").value.trim(),
      telefone: document.getElementById("telefoneAtualizar").value.trim(),
      instituicao: document.getElementById("instituicaoAtualizar").value.trim(),
      curso: document.getElementById("cursoAtualizar").value.trim(),
      turno: document.getElementById("turnoAtualizar").value.trim(),
      periodo: document.getElementById("periodoAtualizar").value.trim(),
    };

    try {
      await updateDoc(doc(db, "alunos", user.uid), dados);
      alert("Perfil atualizado com sucesso!");
      modal.style.display = "none";
      Object.entries(dados).forEach(([k, v]) => {
        const id = k + "Usuario";
        const el = document.getElementById(id);
        if (el) el.textContent = v;
      });
    } catch (err) {
      alert("Erro ao atualizar perfil: " + err.message);
      console.error(err);
    }
  });
}

function initAtualizarEmail() {
  const modalEmail = document.getElementById("modalAtualizarEmail");
  const btnFecharEmail = document.getElementById("btnFecharEmail");
  const formEmail = document.getElementById("formAtualizarEmail");
  const btnAbrirEmail = document.getElementById("btnAtualizarEmail");

  if (!modalEmail || !btnFecharEmail || !formEmail || !btnAbrirEmail) return;

  // Abrir modal
  btnAbrirEmail.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) return alert("Usuário não autenticado.");
    document.getElementById("emailAtual").value = user.email || "";
    modalEmail.style.display = "block";
  });

  // Fechar modal
  btnFecharEmail.addEventListener("click", () => (modalEmail.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === modalEmail) modalEmail.style.display = "none";
  });

  // Submeter formulário
  formEmail.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return alert("Usuário não autenticado.");

    const emailAtual = document.getElementById("emailAtual").value.trim();
    const senhaAtual = document.getElementById("senhaAtualEmail").value.trim();
    const novoEmail = document.getElementById("novoEmail").value.trim();

    if (!emailAtual || !senhaAtual || !novoEmail) {
      return alert("Preencha todos os campos.");
    }
    if (emailAtual === novoEmail) {
      return alert("O novo e-mail é igual ao atual.");
    }

    try {
      // Reautentica o usuário com a senha informada
      const cred = EmailAuthProvider.credential(emailAtual, senhaAtual);
      await reauthenticateWithCredential(user, cred);

      // Envia link de verificação antes de alterar o e-mail
      await verifyBeforeUpdateEmail(user, novoEmail);

      alert("Um link de verificação foi enviado para o novo e-mail. Confirme para concluir a atualização.");
      modalEmail.style.display = "none";
      formEmail.reset();
    } catch (err) {
      console.error("Erro ao atualizar e-mail:", err);
      const code = err.code || "";

      if (code.includes("auth/invalid-credential") || code.includes("auth/invalid-login-credentials")) {
        alert("Senha incorreta. Verifique e tente novamente.");
      } else if (code.includes("auth/requires-recent-login")) {
        alert("Por segurança, faça login novamente antes de alterar o e-mail.");
      } else if (code.includes("auth/email-already-in-use")) {
        alert("O novo e-mail informado já está em uso.");
      } else if (code.includes("auth/invalid-email")) {
        alert("Formato de e-mail inválido.");
      } else if (code.includes("auth/operation-not-allowed")) {
        alert("Atualização de e-mail não permitida. Verifique as configurações do Firebase Authentication.");
      } else {
        alert("Erro ao atualizar e-mail: " + (err.message || err));
      }
    }
  });
}
