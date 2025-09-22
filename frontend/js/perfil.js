// frontend/js/perfil.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let modalCarregado = false;

/**
 * Injetar o modal do perfil na página
 */
export async function carregarModalPerfil() {
  if (modalCarregado) return;

  try {
    const resposta = await fetch("../perfilModal.html");
    const html = await resposta.text();
    document.body.insertAdjacentHTML("beforeend", html);

    const modal = document.getElementById("modalPerfil");
    const btnFechar = document.getElementById("btnFecharPerfil");

    if (btnFechar) {
      btnFechar.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    // Eventos dos novos botões
    const btnAtualizar = document.getElementById("btnAtualizarPerfil");
    const btnAlterarSenha = document.getElementById("btnAlterarSenha");

    if (btnAtualizar) {
      btnAtualizar.addEventListener("click", () => {
        console.log("Atualizar Perfil clicado!");
        // Aqui você pode adicionar a lógica para atualizar o perfil
      });
    }

    if (btnAlterarSenha) {
      btnAlterarSenha.addEventListener("click", () => {
        console.log("Alterar Senha clicado!");
        // Aqui você pode adicionar a lógica para alterar a senha
      });
    }

    modalCarregado = true;
    return true;

  } catch (err) {
    console.error("Erro ao carregar modal do perfil:", err);
    return false;
  }
}

/**
 * Abrir modal do perfil (só funciona após o modal ser carregado)
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
 * Preenche os dados do usuário no modal
 */
async function carregarDadosUsuario() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const campos = {
      emailUsuario: user.email || "Não informado",
      idUsuario: user.uid
    };

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
