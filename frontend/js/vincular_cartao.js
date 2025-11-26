document.getElementById("formCartao").addEventListener("submit", async (e) => {
      e.preventDefault();

      const uidAluno = document.getElementById("uidAluno").value.trim();
      const uidCartao = document.getElementById("uidCartao").value.trim();
      const messageDiv = document.getElementById("message");

      // Limpar mensagem anterior
      messageDiv.className = '';
      messageDiv.textContent = '';

      try {
        const resp = await fetch("/alunos/vincular-cartao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uidAluno, uidCartao })
        });

        const data = await resp.json();

        if (resp.ok) {
          // Sucesso
          messageDiv.className = 'success';
          messageDiv.textContent = data.mensagem || "✅ Cartão vinculado com sucesso!";
          
          // Limpar campos
          document.getElementById("uidAluno").value = '';
          document.getElementById("uidCartao").value = '';
        } else {
          // Erro
          messageDiv.className = 'error';
          messageDiv.textContent = data.erro || "❌ Erro ao vincular cartão.";
        }
      } catch (error) {
        // Erro de conexão
        messageDiv.className = 'error';
        messageDiv.textContent = "❌ Erro de conexão com o servidor.";
        console.error("Erro:", error);
      }
    });