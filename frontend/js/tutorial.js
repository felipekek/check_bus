/* export function initTutorial(passos, storageKey) {
  const tutorialVisto = localStorage.getItem(storageKey);
  if (tutorialVisto) return;

  const overlay = document.getElementById('tutorialOverlay');
  const highlight = document.getElementById('tutorialHighlight');
  const popup = document.getElementById('tutorialPopup');
  const title = document.getElementById('tutorialTitle');
  const text = document.getElementById('tutorialText');
  const skipBtn = document.getElementById('tutorialSkipBtn');
  const nextBtn = document.getElementById('tutorialNextBtn');
  const stepCounter = document.getElementById('tutorialStepCounter');

  if (!overlay || !highlight || !popup) {
    console.error('Elementos do tutorial não encontrados no DOM.');
    return;
  }

  let passoAtual = 0;

  function endTutorial() {
    overlay.style.display = 'none';
    highlight.style.display = 'none';
    popup.style.display = 'none';
    localStorage.setItem(storageKey, 'true');
    window.removeEventListener('resize', showStep);
  }

  function showStep() {
    if (passoAtual >= passos.length) {
      endTutorial();
      return;
    }

    const step = passos[passoAtual];
    const targetElement = document.querySelector(step.element);

    if (!targetElement) {
      passoAtual++;
      showStep();
      return;
    }

    const rect = targetElement.getBoundingClientRect();

    // ✅ POSICIONAMENTO CORRIGIDO DO HIGHLIGHT
    highlight.style.display = 'block';
    highlight.style.width = `${rect.width + 16}px`;
    highlight.style.height = `${rect.height + 16}px`;
    highlight.style.top = `${rect.top + window.scrollY - 8}px`;
    highlight.style.left = `${rect.left + window.scrollX - 8}px`;

    // ✅ DETECTAR SE O ELEMENTO TEM BORDER-RADIUS
    const computedStyle = window.getComputedStyle(targetElement);
    const borderRadius = computedStyle.borderRadius;
    if (borderRadius && borderRadius !== '0px') {
      highlight.setAttribute('data-rounded', 'true');
      highlight.style.borderRadius = borderRadius;
    } else {
      highlight.removeAttribute('data-rounded');
      highlight.style.borderRadius = '0';
    }

    // Atualizar conteúdo do popup
    title.innerText = step.title;
    text.innerText = step.text;
    popup.style.display = 'block';

    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;
    const margin = 20;

    let popupLeft, popupTop;

    // Posicionar popup
    if (step.position === 'bottom') {
      popupTop = rect.bottom + window.scrollY + margin;
      popupLeft = rect.left + window.scrollX + rect.width / 2 - popupWidth / 2;
      popup.className = 'tutorial-popup top';
    } else if (step.position === 'top') {
      popupTop = rect.top + window.scrollY - popupHeight - margin;
      popupLeft = rect.left + window.scrollX + rect.width / 2 - popupWidth / 2;
      popup.className = 'tutorial-popup bottom';
    } else if (step.position === 'left') {
      popupTop = rect.top + window.scrollY + rect.height / 2 - popupHeight / 2;
      popupLeft = rect.left + window.scrollX - popupWidth - margin;
      popup.className = 'tutorial-popup right';
    } else { // right
      popupTop = rect.top + window.scrollY + rect.height / 2 - popupHeight / 2;
      popupLeft = rect.right + window.scrollX + margin;
      popup.className = 'tutorial-popup left';
    }

    // ✅ GARANTIR QUE O POPUP FIQUE DENTRO DA TELA
    if (popupLeft < margin) popupLeft = margin;
    if (popupLeft + popupWidth > window.innerWidth - margin) {
      popupLeft = window.innerWidth - popupWidth - margin;
    }
    if (popupTop < margin) popupTop = margin;
    if (popupTop + popupHeight > window.innerHeight - margin) {
      popupTop = window.innerHeight - popupHeight - margin;
    }

    popup.style.top = `${popupTop}px`;
    popup.style.left = `${popupLeft}px`;

    stepCounter.innerText = `${passoAtual + 1}/${passos.length}`;
    
    if (passoAtual === passos.length - 1) {
      nextBtn.innerText = 'Concluir';
    } else {
      nextBtn.innerText = 'Próximo';
    }
  }

  skipBtn.addEventListener('click', endTutorial);
  nextBtn.addEventListener('click', () => {
    passoAtual++;
    showStep();
  });

  overlay.style.display = 'block';
  showStep();
  window.addEventListener('resize', showStep);
} */