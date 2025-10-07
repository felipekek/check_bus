// frontend/js/perfil.js
import { auth, db } from "./firebase-config.js";
import { 
  onAuthStateChanged, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let modalCarregado = false;

/**
 * Carrega o modal do perfil
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

    // Botão Atualizar Perfil
    document.getElementById("btnAtualizarPerfil")?.addEventListener("click", () => {
      alert("Funcionalidade de atualizar perfil ainda não implementada.");
    });

    // Inicializa Alterar Senha
    if (document.getElementById("btnAlterarSenha")) initAlterarSenha();

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
 * Carrega os dados do usuário no modal
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

  // Abrir modal
  btnAlterarSenha.addEventListener("click", () => { modalSenha.style.display = "block"; });

  // Fechar modal
  btnFecharSenha.addEventListener("click", () => { modalSenha.style.display = "none"; });
  window.addEventListener("click", (e) => { if (e.target === modalSenha) modalSenha.style.display = "none"; });

  // Submeter formulário de nova senha
  formSenha.addEventListener("submit", async (e) => {
    e.preventDefault();

    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmaNovaSenha = document.getElementById("confirmaNovaSenha").value;

    if (!senhaAtual || !novaSenha || !confirmaNovaSenha) {
      alert("Preencha todos os campos!");
      return;
    }

    if (novaSenha !== confirmaNovaSenha) {
      alert("A nova senha e a confirmação não coincidem!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado.");

      // Reautenticação
      const cred = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, cred);

      // Atualiza a senha
      await updatePassword(user, novaSenha);
      alert("Senha alterada com sucesso!");
      modalSenha.style.display = "none";

      // Limpa campos
      document.getElementById("senhaAtual").value = "";
      document.getElementById("novaSenha").value = "";
      document.getElementById("confirmaNovaSenha").value = "";
    } catch (err) {
      console.error(err);

      // Mensagens amigáveis
      let mensagem = "Erro ao alterar a senha.";
      if (err.code === "auth/invalid-login-credentials") {
        mensagem = "Senha atual incorreta. Verifique e tente novamente.";
      } else if (err.code === "auth/weak-password") {
        mensagem = "A nova senha é muito fraca. Use pelo menos 6 caracteres.";
      } else if (err.message) {
        mensagem = err.message;
      }

      alert(mensagem);
    }
  });
}
