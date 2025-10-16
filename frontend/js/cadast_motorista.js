const token = localStorage.getItem("token");
const tipoUsuario = localStorage.getItem("tipoUsuario");

// Redireciona se não for admin
if (!token || tipoUsuario !== "admin") {
  alert("Acesso negado!");
  window.location.href = "index.html";
}

const form = document.getElementById("formMotorista");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const motorista = {
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
    cnh: form.cnh.value.trim(),
    cnhCategoria: form.categoria.value,
    cursoColetivo: form.curso.checked,
    experienciaBC: form.experiencia.checked,
    semInfracoes: form.infracoes.checked,
    apto: form.aptidao.checked,
    tipo: "motorista"
  };

  // Verifica os requisitos legais
  motorista.requisitosValidados =
    motorista.cnhCategoria === "D" &&
    motorista.cursoColetivo &&
    motorista.experienciaBC &&
    motorista.semInfracoes &&
    motorista.apto;

  try {
    const res = await fetch("/admin/motoristas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(motorista)
    });

    if (!res.ok) throw new Error("Erro ao cadastrar motorista");

    alert("Motorista cadastrado com sucesso!");
    form.reset();
  } catch (err) {
    alert("Erro: " + err.message);
  }
});