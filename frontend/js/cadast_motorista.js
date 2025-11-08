// frontend/js/cadast_motorista.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formMotorista");

  // Máscaras de entrada
  const cpfMask = IMask(document.getElementById("cpf"), { mask: "000.000.000-00" });
  const telefoneMask = IMask(document.getElementById("telefone"), { mask: "(00) 00000-0000" });

  // Validação de CPF
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

  // Submissão do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cnh = document.getElementById("cnh").value.trim();
    const categoria = document.getElementById("categoria").value;
    const validadeCnh = document.getElementById("validadeCnh").value;
    const turno = document.getElementById("turno").value;
    const status = document.getElementById("status") ? document.getElementById("status").value : "Ativo";
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    // Validações
    if (!nome || !email || !cpf || !telefone || !cnh || !categoria || !validadeCnh || !turno) {
      alert("⚠️ Preencha todos os campos obrigatórios!");
      return;
    }

    if (!validarCPF(cpf)) {
      alert("❌ CPF inválido!");
      return;
    }

    const validade = new Date(validadeCnh);
    if (validade < new Date()) {
      alert("⚠️ A CNH está vencida!");
      return;
    }

    if (!senha || senha.length < 6) {
      alert("⚠️ A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("⚠️ As senhas não coincidem!");
      return;
    }

    const motorista = {
      nome,
      email,
      cpf,
      telefone,
      cnh,
      categoria,
      validadeCnh,
      turno,
      status,
      senha,
    };

    try {
      // Faz o POST para o backend
      const response = await fetch("http://localhost:3000/motoristas/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(motorista),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`❌ Erro ao cadastrar motorista: ${data.erro || "Tente novamente."}`);
        return;
      }

      alert("✅ Motorista cadastrado com sucesso!");
      form.reset();
      cpfMask.updateValue();
      telefoneMask.updateValue();

    } catch (err) {
      console.error("Erro ao enviar formulário:", err);
      alert("❌ Erro de conexão com o servidor. Verifique se o backend está rodando.");
    }
  });
});
