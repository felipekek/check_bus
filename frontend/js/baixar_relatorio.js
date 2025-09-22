const checkboxTodas = document.getElementById("checkboxTodas");
  const checkboxes = document.querySelectorAll(".checkbox-coluna");

  // Marca/desmarca todas
  checkboxTodas.addEventListener("change", () => {
    checkboxes.forEach(cb => cb.checked = checkboxTodas.checked);
  });

  // Atualiza checkbox "Todas" se todas estiverem marcadas
  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      checkboxTodas.checked = Array.from(checkboxes).every(c => c.checked);
    });
  });