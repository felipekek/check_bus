// cadast_motorista.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formMotorista");

  // 🔹 Máscaras com IMask.js
  const cpfMask = IMask(document.getElementById("cpf"), { mask: "000.000.000-00" });
  const telefoneMask = IMask(document.getElementById("telefone"), { mask: "(00) 00000-0000" });
  const placaMask = IMask(document.getElementById("onibus"), {
    mask: "AAA-0000",
    prepare: (str) => str.toUpperCase(),
    commit: (value, masked) => masked._value = value.toUpperCase()
  });

  // 🔹 Limites de caracteres
  document.getElementById("nome").setAttribute("maxlength", 50);
  document.getElementById("cnh").setAttribute("maxlength", 11);
  document.getElementById("rota").setAttribute("maxlength", 30);
  document.getElementById("instituicao").setAttribute("maxlength", 30);

  // 🔹 Função de validação de CPF
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
  };

  // 🔹 Previne letras no CNH
  const cnhInput = document.getElementById("cnh");
  cnhInput.addEventListener("input", () => {
    cnhInput.value = cnhInput.value.replace(/\D/g, ""); // apenas números
  });

  // 🔹 Evento de envio do formulário
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cnh = document.getElementById("cnh").value.trim();
    const categoria = document.getElementById("categoria").value;
    const validadeCnh = document.getElementById("validadeCnh").value;
    const rota = document.getElementById("rota").value.trim();
    const instituicao = document.getElementById("instituicao").value.trim();
    const turno = document.getElementById("turno").value;
    const onibus = document.getElementById("onibus").value.trim();
    const dataAdmissao = document.getElementById("dataAdmissao").value;
    const status = document.getElementById("status").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    // 🔸 Validação básica de preenchimento
    if (!nome || !cpf || !telefone || !email || !cnh || !categoria || !validadeCnh || !rota || !instituicao || !turno || !onibus || !dataAdmissao) {
      alert("⚠️ Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    // 🔸 CPF válido
    if (!validarCPF(cpf)) {
      alert("❌ CPF inválido! Verifique e tente novamente.");
      return;
    }

    // 🔸 Categoria CNH (somente D ou E)
    if (categoria !== "D" && categoria !== "E") {
      alert("⚠️ O motorista deve possuir CNH categoria D ou E para dirigir ônibus.");
      return;
    }

    // 🔸 Validade CNH
    const hoje = new Date();
    const validade = new Date(validadeCnh);
    if (validade < hoje) {
      alert("⚠️ A CNH está vencida! Atualize a validade antes de cadastrar.");
      return;
    }

    // 🔸 Senha (opcional)
    if (senha || confirmarSenha) {
      if (senha.length < 6) {
        alert("⚠️ A senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (senha !== confirmarSenha) {
        alert("⚠️ As senhas não coincidem!");
        return;
      }
    }

    // 🔸 Monta o objeto do motorista
    const motorista = {
      nome,
      cpf,
      telefone,
      email,
      cnh,
      categoria,
      validadeCnh,
      rota,
      instituicao,
      turno,
      onibus,
      dataAdmissao,
      status,
      senha
    };

    // 🔸 Salva no localStorage
    let motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];
    motoristas.push(motorista);
    localStorage.setItem("motoristas", JSON.stringify(motoristas));

    alert("✅ Motorista cadastrado com sucesso!");
    form.reset();
    cpfMask.updateValue();
    telefoneMask.updateValue();
    placaMask.updateValue();
  });
});
