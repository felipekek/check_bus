// frontend/js/perfil.js
import { auth, db } from "./firebase-config.js";
import { 
  onAuthStateChanged, 
  updatePassword, 
  updateEmail,
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let modalCarregado = false;
let perfilIniciado = false;
let atualizarPerfilIniciado = false;
let atualizarEmailIniciado = false;

/**
 * Carrega o modal do perfil principal
 */
export async function carregarModalPerfil() {
  if (modalCarregado) return;

  try {
    const resposta = await fetch("../perfilModal.html");
    const html = await resposta.text();
    document.body.insertAdjacentHTML("beforeend", html);

    const modal = document.getElementById("modalPerfil");
    const btnFechar = document.getElementById("btnFecharPerfil");

    if (btnFechar) btnFechar.addEventListener("click", () => { modal.style.display = "none"; });
    window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

    // --- BOTÕES DO MODAL ---
    const btnAtualizarPerfil = document.getElementById("btnAtualizarPerfil");
    const btnAlterarSenha = document.getElementById("btnAlterarSenha");
    const btnAtualizarEmail = document.getElementById("btnAtualizarEmail");
    const modalAtualizar = document.getElementById("modalAtualizarPerfil");

    // Atualizar informações gerais do perfil
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

    // Alterar senha
    if (!perfilIniciado && btnAlterarSenha) {
      initAlterarSenha();
      perfilIniciado = true;
    }

    // Atualizar e-mail
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

/**
 * Abre o modal do perfil
 */
export async function abrirPerfil() {
  if (!modalCarregado) {
    const carregou = await carregarModalPerfil();
    if (!carregou) return;
  }

  const modal = document.getElementById("modalPerfil");
  if (!modal) return;

  modal.style.display = "block";
  carregarDadosUsuario();
}

/**
 * Carrega os dados do usuário no modal principal
 */
async function carregarDadosUsuario() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

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

/**
 * Inicializa o modal de Alterar Senha
 */
function initAlterarSenha() {
  const btnAlterarSenha = document.getElementById("btnAlterarSenha");
  const modalSenha = document.getElementById("modalAlterarSenha");
  const btnFecharSenha = document.getElementById("btnFecharSenha");
  const formSenha = document.getElementById("formAlterarSenha");

  if (!btnAlterarSenha || !modalSenha || !btnFecharSenha || !formSenha) return;

  btnAlterarSenha.addEventListener("click", () => { modalSenha.style.display = "block"; });
  btnFecharSenha.addEventListener("click", () => { modalSenha.style.display = "none"; });
  window.addEventListener("click", (e) => { if (e.target === modalSenha) modalSenha.style.display = "none"; });

  formSenha.addEventListener("submit", async (e) => {
    e.preventDefault();
    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmaNovaSenha = document.getElementById("confirmaNovaSenha").value;

    if (!senhaAtual || !novaSenha || !confirmaNovaSenha)
      return alert("Preencha todos os campos!");

    if (novaSenha !== confirmaNovaSenha)
      return alert("As senhas não coincidem!");

    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, novaSenha);
      alert("Senha alterada com sucesso!");
      modalSenha.style.display = "none";
      formSenha.reset();
    } catch (err) {
      console.error(err);
      alert("Erro ao alterar senha: " + err.message);
    }
  });
}

/**
 * Inicializa o modal de Atualizar Perfil
 */
function initAtualizarPerfil() {
  if (atualizarPerfilIniciado) return;
  atualizarPerfilIniciado = true;

  const modalAtualizar = document.getElementById("modalAtualizarPerfil");
  const btnFecharAtualizar = document.getElementById("btnFecharAtualizarPerfil");
  const formAtualizar = document.getElementById("formAtualizarPerfil");

  if (!modalAtualizar || !btnFecharAtualizar || !formAtualizar) return;

  btnFecharAtualizar.addEventListener("click", () => { modalAtualizar.style.display = "none"; });
  window.addEventListener("click", (e) => { if (e.target === modalAtualizar) modalAtualizar.style.display = "none"; });

  formAtualizar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Usuário não autenticado.");

    const nome = document.getElementById("nomeAtualizar").value.trim();
    const telefone = document.getElementById("telefoneAtualizar").value.trim();
    const instituicao = document.getElementById("instituicaoAtualizar").value.trim();
    const curso = document.getElementById("cursoAtualizar").value.trim();
    const turno = document.getElementById("turnoAtualizar").value.trim();
    const periodo = document.getElementById("periodoAtualizar").value.trim();

    try {
      await updateDoc(doc(db, "alunos", user.uid), { nome, telefone, instituicao, curso, turno, periodo });
      alert("Perfil atualizado com sucesso!");
      modalAtualizar.style.display = "none";

      document.getElementById("nomeUsuario").textContent = nome;
      document.getElementById("telefoneUsuario").textContent = telefone;
      document.getElementById("instituicaoUsuario").textContent = instituicao;
      document.getElementById("cursoUsuario").textContent = curso;
      document.getElementById("turnoUsuario").textContent = turno;
      document.getElementById("periodoUsuario").textContent = periodo;
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      alert("Erro ao atualizar perfil. Tente novamente.");
    }
  });
}

/**
 * Inicializa o modal de Atualizar E-mail
 * 
 * - Reautentica o usuário com a senha atual;
 * - Atualiza o e-mail no Firebase Authentication;
 * - Atualiza o e-mail também na coleção do Firestore (alunos).
 */
function initAtualizarEmail() {
  const modalEmail = document.getElementById("modalAtualizarEmail");
  const btnFecharEmail = document.getElementById("btnFecharEmail");
  const formEmail = document.getElementById("formAtualizarEmail");

  const btnAbrirEmail = document.getElementById("btnAtualizarEmail");

  if (!modalEmail || !btnFecharEmail || !formEmail || !btnAbrirEmail) return;

  // Abrir modal de e-mail
  btnAbrirEmail.addEventListener("click", () => {
    document.getElementById("emailAtual").value = auth.currentUser?.email || "";
    modalEmail.style.display = "block";
  });

  // Fechar modal
  btnFecharEmail.addEventListener("click", () => modalEmail.style.display = "none");
  window.addEventListener("click", (e) => { if (e.target === modalEmail) modalEmail.style.display = "none"; });

  // Enviar formulário
  formEmail.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Usuário não autenticado.");

    const senhaAtual = document.getElementById("senhaAtualEmail").value;
    const novoEmail = document.getElementById("novoEmail").value;

    try {
      const cred = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, cred);
      await updateEmail(user, novoEmail);
      await updateDoc(doc(db, "alunos", user.uid), { email: novoEmail });

      alert("E-mail atualizado com sucesso!");
      modalEmail.style.display = "none";
      document.getElementById("emailUsuario").textContent = novoEmail;
    } catch (err) {
      console.error("Erro ao atualizar e-mail:", err);
      alert("Erro ao atualizar e-mail: " + err.message);
    }
  });
}
