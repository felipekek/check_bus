// frontend/js/cadastro.js
// Faz cadastro chamando o backend (Express + Firebase)

// Validação de campos do formulário de cadastro

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const instituicao = document.getElementById("instituicao").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const message = document.getElementById("message");

  try {
    const response = await fetch("/auth/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cpf, instituicao, email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      message.style.color = "green";
      message.textContent = data.mensagem;

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.erro || "Erro no cadastro";
    }
  } catch (err) {
    message.style.color = "red";
    message.textContent = "Erro de conexão com o servidor.";
  }
});

document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Coleta dos campos
  const nome = document.getElementById('nome').value;
  const cpf = document.getElementById('cpf').value;
  const instituicao = document.getElementById('instituicao').value;
  const email = document.getElementById('email').value;
  const telefone = document.getElementById('telefone').value;
  const curso = document.getElementById('curso').value;
  const turno = document.getElementById('turno').value;
  const periodo = document.getElementById('periodo').value;
  const senha = document.getElementById('senha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;

  // Validação de senha
  if (senha !== confirmarSenha) {
    document.getElementById('confirmarSenhaMessage').textContent = 'As senhas não coincidem.';
    return;
  } else {
    document.getElementById('confirmarSenhaMessage').textContent = '';
  }

  // Monta o objeto de cadastro
  const dadosCadastro = {
    nome,
    cpf,
    instituicao,
    email,
    telefone,
    curso,
    turno,
    periodo,
    senha
  };

  try {
    const resposta = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosCadastro)
    });

    const resultado = await resposta.json();
    if (resposta.ok) {
      document.getElementById('message').textContent = 'Cadastro realizado com sucesso!';
      // Redirecionar ou limpar formulário, se desejar
    } else {
      document.getElementById('message').textContent = resultado.message || 'Erro ao cadastrar.';
    }
  } catch (error) {
    document.getElementById('message').textContent = 'Erro ao conectar ao servidor.';
  }
});

const form = document.getElementById("registerForm");
const message = document.getElementById("message");

// Campos
const nomeInput = document.getElementById("nome");
const cpfInput = document.getElementById("cpf");
const instituicaoInput = document.getElementById("instituicao");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

// Mensagens
const nomeMessage = document.getElementById("nomeMessage");
const cpfMessage = document.getElementById("cpfMessage");
const instituicaoMessage = document.getElementById("instituicaoMessage");
const emailMessage = document.getElementById("emailMessage");
const senhaMessage = document.getElementById("senhaMessage");

// Função para validar CPF real
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

// Máscara do CPF
cpfInput.addEventListener("input", function(e) {
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

// Validações em tempo real
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

// Validação final no envio
form.addEventListener("submit", function(e) {
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
    e.preventDefault();
    message.textContent = "⚠️ Corrija os erros antes de enviar.";
    message.style.color = "red";
  } else {
    message.textContent = "";
  }
});