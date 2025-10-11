  grid.style.visibility = "visible";

  // Define e inicia o tutorial para a página principal
  const passosTutorial = [
    {
        element: '#menuGrid',
        title: 'Menu de Opções',
        text: 'Este é o menu principal. Use estes atalhos para navegar pelas diferentes seções do aplicativo.',
        position: 'bottom'
    },
    {
        element: '#btnPerfil',
        title: 'Acesse seu Perfil',
        text: 'Clique aqui para ver e editar suas informações de perfil, como nome e e-mail.',
        position: 'top'
    },
    {
        element: '#btnFeedback',
        title: 'Envie seu Feedback',
        text: 'Sua opinião é importante! Use este botão para nos enviar sugestões ou relatar problemas.',
        position: 'top'
    }
  ];
  initTutorial(passosTutorial, 'tutorialHomeVisto');

  carregarHorarios();
