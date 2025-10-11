export function initTutorial(passos, storageKey) {
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
        console.error('Elementos do tutorial não encontrados no DOM. Verifique se o HTML do tutorial está incluído na página.');
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

        highlight.style.display = 'block';
        highlight.style.width = `${rect.width + 10}px`;
        highlight.style.height = `${rect.height + 10}px`;
        highlight.style.top = `${rect.top - 5}px`;
        highlight.style.left = `${rect.left - 5}px`;

        title.innerText = step.title;
        text.innerText = step.text;
        popup.style.display = 'block';

        const popupWidth = popup.offsetWidth;
        const popupHeight = popup.offsetHeight;
        const margin = 15;

        let popupLeft, popupTop;

        if (step.position === 'bottom') {
            popupTop = rect.bottom + margin;
            popupLeft = rect.left + rect.width / 2 - popupWidth / 2;
            popup.className = 'tutorial-popup top';
        } else if (step.position === 'top') {
            popupTop = rect.top - popupHeight - margin;
            popupLeft = rect.left + rect.width / 2 - popupWidth / 2;
            popup.className = 'tutorial-popup bottom';
        }

        if (popupLeft < margin) popupLeft = margin;
        if (popupLeft + popupWidth > window.innerWidth) {
            popupLeft = window.innerWidth - popupWidth - margin;
        }
        if (popupTop < margin) {
            popupTop = margin;
            if (step.position === 'top' && rect.bottom + popupHeight < window.innerHeight) {
                 popupTop = rect.bottom + margin;
                 popup.className = 'tutorial-popup top';
            }
        }
        if (popupTop + popupHeight > window.innerHeight) {
            popupTop = window.innerHeight - popupHeight - margin;
            if (step.position === 'bottom' && rect.top - popupHeight > 0) {
                popupTop = rect.top - popupHeight - margin;
                popup.className = 'tutorial-popup bottom';
            }
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
}
