// frontend/js/cadastro.js
// Faz cadastro chamando o backend (Express + Firebase)
// Inclui validação de campos em tempo real e CPF

const form = document.getElementById("registerForm");
const message = document.getElementById("message");

// Campos
const nomeInput = document.getElementById("nome");
const cpfInput = document.getElementById("cpf");
const instituicaoInput = document.getElementById("instituicao");
const emailInput = document.getElementById("email");
const telefoneInput = document.getElementById("telefone");
const cursoInput = document.getElementById("curso");
const turnoInput = document.getElementById("turno");
const periodoInput = document.getElementById("periodo");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");

// Mensagens
const nomeMessage = document.getElementById("nomeMessage");
const cpfMessage = document.getElementById("cpfMessage");
const instituicaoMessage = document.getElementById("instituicaoMessage");
const emailMessage = document.getElementById("emailMessage");
const senhaMessage = document.getElementById("senhaMessage");
const confirmarSenhaMessage = document.getElementById("confirmarSenhaMessage");

// ===== Função para validar CPF real =====
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// ===== Máscara e validação CPF =====
cpfInput.addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 9) {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (value.length > 6) {
    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else if (value.length > 3) {
    value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  }

  e.target.value = value;

  if (value.length === 14) {
    if (!validarCPF(value)) {
      cpfMessage.textContent = "⚠️ CPF inválido!";
      cpfInput.classList.add("campo-invalido");
      cpfInput.classList.remove("campo-valido");
    } else {
      cpfMessage.textContent = "";
      cpfInput.classList.add("campo-valido");
      cpfInput.classList.remove("campo-invalido");
    }
  } else {
    cpfMessage.textContent = "";
    cpfInput.classList.remove("campo-invalido", "campo-valido");
  }
});

// ===== Validações em tempo real =====
nomeInput.addEventListener("input", () => {
  if (nomeInput.value.trim().length < 3) {
    nomeMessage.textContent = "⚠️ Nome muito curto.";
    nomeInput.classList.add("campo-invalido");
    nomeInput.classList.remove("campo-valido");
  } else {
    nomeMessage.textContent = "";
    nomeInput.classList.add("campo-valido");
    nomeInput.classList.remove("campo-invalido");
  }
});

instituicaoInput.addEventListener("input", () => {
  if (instituicaoInput.value.trim().length < 2) {
    instituicaoMessage.textContent = "⚠️ Informe a instituição.";
    instituicaoInput.classList.add("campo-invalido");
    instituicaoInput.classList.remove("campo-valido");
  } else {
    instituicaoMessage.textContent = "";
    instituicaoInput.classList.add("campo-valido");
    instituicaoInput.classList.remove("campo-invalido");
  }
});

emailInput.addEventListener("input", () => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(emailInput.value)) {
    emailMessage.textContent = "⚠️ E-mail inválido.";
    emailInput.classList.add("campo-invalido");
    emailInput.classList.remove("campo-valido");
  } else {
    emailMessage.textContent = "";
    emailInput.classList.add("campo-valido");
    emailInput.classList.remove("campo-invalido");
  }
});

senhaInput.addEventListener("input", () => {
  if (senhaInput.value.length < 6) {
    senhaMessage.textContent = "⚠️ A senha deve ter pelo menos 6 caracteres.";
    senhaInput.classList.add("campo-invalido");
    senhaInput.classList.remove("campo-valido");
  } else {
    senhaMessage.textContent = "";
    senhaInput.classList.add("campo-valido");
    senhaInput.classList.remove("campo-invalido");
  }
});

// ===== Evento de envio do formulário =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validação de senha e confirmação
  if (senhaInput.value !== confirmarSenhaInput.value) {
    confirmarSenhaMessage.textContent = "As senhas não coincidem.";
    return;
  } else {
    confirmarSenhaMessage.textContent = "";
  }

  // Verifica se existem campos inválidos
  if (
    nomeInput.classList.contains("campo-invalido") ||
    cpfInput.classList.contains("campo-invalido") ||
    instituicaoInput.classList.contains("campo-invalido") ||
    emailInput.classList.contains("campo-invalido") ||
    senhaInput.classList.contains("campo-invalido") ||
    !nomeInput.value ||
    !cpfInput.value ||
    !instituicaoInput.value ||
    !emailInput.value ||
    !senhaInput.value
  ) {
    message.textContent = "⚠️ Corrija os erros antes de enviar.";
    message.style.color = "red";
    return;
  }

  // Monta objeto de cadastro
  const dadosCadastro = {
    nome: nomeInput.value.trim(),
    cpf: cpfInput.value.trim(),
    instituicao: instituicaoInput.value.trim(),
    email: emailInput.value.trim(),
    telefone: telefoneInput.value.trim(),
    curso: cursoInput.value.trim(),
    turno: turnoInput.value,
    periodo: periodoInput.value.trim(),
    senha: senhaInput.value.trim()
  };

  try {
    const resposta = await fetch("/auth/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosCadastro)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      message.style.color = "green";
      message.textContent = resultado.mensagem || "Cadastro realizado com sucesso!";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = resultado.erro || "Erro ao cadastrar.";
    }
  } catch (error) {
    message.style.color = "red";
    message.textContent = "Erro ao conectar ao servidor.";
  }
});
