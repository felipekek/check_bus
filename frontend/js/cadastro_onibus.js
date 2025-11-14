document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("formOnibus");
  const fotoInput = document.getElementById("fotoOnibus");
  const preview = document.getElementById("previewFoto");
  const btnRemover = document.getElementById("btnRemoverFoto");

  let fotoRemovida = false;

  // Preview instantânea da imagem
  fotoInput.addEventListener("change", () => {
    const file = fotoInput.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      fotoRemovida = false; // caso a pessoa troque de ideia e selecione algo
    }
  });

  // 🔥 Função para remover imagem
  btnRemover.addEventListener("click", () => {
    fotoInput.value = "";                        // limpa o input file
    preview.src = "../imagens/placeholder_bus.png"; // volta ao padrão
    fotoRemovida = true;                         // marca que não quer foto
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const numero = document.getElementById("numero").value.trim();
    const placa = document.getElementById("placa").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const ano = document.getElementById("ano").value;
    const capacidade = document.getElementById("capacidade").value;
    const tipo = document.getElementById("tipo").value;
    const status = document.getElementById("status").value;
    const observacoes = document.getElementById("observacoes").value.trim();

    if (!numero || !placa || !modelo || !ano || !capacidade || !tipo || !status) {
      alert("⚠️ Preencha todos os campos obrigatórios.");
      return;
    }

    // FormData para enviar arquivo + texto
    const formData = new FormData();
    formData.append("numero", numero);
    formData.append("placa", placa);
    formData.append("modelo", modelo);
    formData.append("ano", ano);
    formData.append("capacidade", capacidade);
    formData.append("tipo", tipo);
    formData.append("status", status);
    formData.append("observacoes", observacoes);

    // 🔥 Se removida → envia “sem foto” para o backend
    if (fotoRemovida) {
      formData.append("fotoRemovida", "true");
    }

    // 🔥 Se existe foto → envia foto
    else if (fotoInput.files[0]) {
      formData.append("foto", fotoInput.files[0]);
    }

    try {
      const response = await fetch("http://localhost:3000/onibus/cadastrar", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        alert("❌ Erro ao cadastrar ônibus: " + (data.erro || "Tente novamente."));
        return;
      }

      alert("✅ Ônibus cadastrado com sucesso!");

      form.reset();
      preview.src = "../imagens/placeholder_bus.png";
      fotoRemovida = false;

    } catch (err) {
      alert("❌ Erro ao conectar ao servidor.");
      console.error(err);
    }
  });

});
