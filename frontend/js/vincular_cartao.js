document.getElementById("formCartao").addEventListener("submit", async (e) => {
  e.preventDefault();

  const uidAluno = document.getElementById("uidAluno").value.trim();
  const uidCartao = document.getElementById("uidCartao").value.trim();

  const resp = await fetch("/alunos/vincular-cartao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uidAluno, uidCartao })
  });

  const data = await resp.json();
  alert(data.mensagem || data.erro);
});
