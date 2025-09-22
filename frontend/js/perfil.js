const modal = document.getElementById("perfilModal");
    const abrirBtn = document.getElementById("abrirPerfil");
    const fecharBtn = document.getElementById("fecharModal");
    const atualizarBtn = document.getElementById("atualizarPerfil");

    // Abrir modal
    abrirBtn.onclick = () => {
      carregarDados();
      modal.style.display = "flex";
    };

    // Fechar modal
    fecharBtn.onclick = () => {
      modal.style.display = "none";
    };

    // Fechar clicando fora
    window.onclick = (e) => {
      if (e.target == modal) {
        modal.style.display = "none";
      }
    };

    // Carregar dados do localStorage
    function carregarDados() {
      document.getElementById("nome").value = localStorage.getItem("nome") || "";
      document.getElementById("telefone").value = localStorage.getItem("telefone") || "";
      document.getElementById("cpf").value = localStorage.getItem("cpf") || "";
      document.getElementById("instituicao").value = localStorage.getItem("instituicao") || "";
      document.getElementById("outraInstituicao").value = localStorage.getItem("outraInstituicao") || "";
      document.getElementById("curso").value = localStorage.getItem("curso") || "";
      document.getElementById("matricula").value = localStorage.getItem("matricula") || "";
      document.getElementById("email").value = localStorage.getItem("email") || "";
      document.getElementById("periodo").value = localStorage.getItem("periodo") || "";
    }

    // Atualizar dados
    atualizarBtn.onclick = () => {
      localStorage.setItem("nome", document.getElementById("nome").value);
      localStorage.setItem("telefone", document.getElementById("telefone").value);
      localStorage.setItem("cpf", document.getElementById("cpf").value);
      localStorage.setItem("instituicao", document.getElementById("instituicao").value);
      localStorage.setItem("outraInstituicao", document.getElementById("outraInstituicao").value);
      localStorage.setItem("curso", document.getElementById("curso").value);
      localStorage.setItem("matricula", document.getElementById("matricula").value);
      localStorage.setItem("email", document.getElementById("email").value);
      localStorage.setItem("periodo", document.getElementById("periodo").value);

      alert("Perfil atualizado com sucesso!");
      modal.style.display = "none";
    };