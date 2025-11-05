// tutorial.js
let passoAtual = 0;

const passos = [
  { element: '#botao1', texto: 'Este é o primeiro botão.' },
  { element: '#botao2', texto: 'Agora clique neste botão.' },
  { element: '#botao3', texto: 'Por fim, use este botão.' }
];

// Cria elementos principais
const overlay = document.createElement('div');
overlay.className = 'tutorial-overlay';
document.body.appendChild(overlay);

const highlight = document.createElement('div');
highlight.className = 'tutorial-highlight';
document.body.appendChild(highlight);

const popup = document.createElement('div');
popup.className = 'tutorial-popup';
document.body.appendChild(popup);

// Função principal
function showStep() {
  if (passoAtual >= passos.length) {
    // Finaliza tutorial
    overlay.classList.remove('visible');
    highlight.classList.remove('visible');
    popup.classList.remove('visible');
    setTimeout(() => {
      overlay.style.display = 'none';
      highlight.style.display = 'none';
      popup.style.display = 'none';
    }, 300);
    return;
  }

  const step = passos[passoAtual];
  const targetElement = document.querySelector(step.element);

  if (!targetElement) {
    passoAtual++;
    showStep();
    return;
  }

  // Garante que o elemento está visível
  targetElement.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
  const rect = targetElement.getBoundingClientRect();

  // Mostra overlay e elementos
  overlay.style.display = 'block';
  highlight.style.display = 'block';
  popup.style.display = 'block';

  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    highlight.style.width = `${rect.width + 10}px`;
    highlight.style.height = `${rect.height + 10}px`;
    highlight.style.top = `${rect.top - 5}px`;
    highlight.style.left = `${rect.left - 5}px`;
    highlight.classList.add('visible');
  });

  // Atualiza conteúdo do popup
  popup.innerHTML = `
    <p>${step.texto}</p>
    <div>
      <button id="nextStep">Próximo</button>
      <button id="closeTutorial">Fechar</button>
    </div>
  `;

  // Calcula posição do popup
  requestAnimationFrame(() => {
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    let popupTop = rect.bottom + 12;
    let popupLeft = rect.left + rect.width / 2 - popupWidth / 2;

    if (popupLeft < 8) popupLeft = 8;
    if (popupLeft + popupWidth > window.innerWidth - 8)
      popupLeft = window.innerWidth - popupWidth - 8;
    if (popupTop + popupHeight > window.innerHeight - 8)
      popupTop = rect.top - popupHeight - 12;

    popup.style.top = `${popupTop}px`;
    popup.style.left = `${popupLeft}px`;
    popup.classList.add('visible');
  });

  // Botão "Próximo"
  popup.querySelector('#nextStep').onclick = () => {
    popup.classList.remove('visible');
    highlight.classList.remove('visible');
    setTimeout(() => {
      passoAtual++;
      showStep();
    }, 250);
  };

  // Botão "Fechar"
  popup.querySelector('#closeTutorial').onclick = closeTutorial;

  // Clique fora do destaque fecha também
  overlay.onclick = closeTutorial;
}

function closeTutorial() {
  overlay.classList.remove('visible');
  popup.classList.remove('visible');
  highlight.classList.remove('visible');
  setTimeout(() => {
    overlay.style.display = 'none';
    popup.style.display = 'none';
    highlight.style.display = 'none';
  }, 300);
}

window.addEventListener('resize', () => {
  if (popup.style.display === 'block') showStep();
});

// Inicia tutorial automaticamente
showStep();
