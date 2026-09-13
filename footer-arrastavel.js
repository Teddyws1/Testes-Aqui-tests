/**
 * ============================================================================
 * MÓDULO DE INTERAÇÃO DO FOOTER — COM BACKDROP (BLOQUEIO DE CLIQUE EXTERNO)
 * ============================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
    const drawer = document.getElementById("footer-drawer");
    const handle = document.getElementById("footer-drag-handle");
    const toggleBtn = document.getElementById("toggleDrawer") || document.querySelector(".resumo-aba");

    if (!drawer) return;

    // Garante que o drawer seja a âncora para a posição absoluta
    if (getComputedStyle(drawer).position === 'static') {
        drawer.style.position = "relative";
    }

    // Criação dinâmica do Backdrop (camada de bloqueio)
    let backdrop = document.getElementById("footerBackdrop");
    if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "footerBackdrop";
        backdrop.className = "footer-backdrop";
        
        // Estilos essenciais injetados via JS para garantir o funcionamento imediato
        backdrop.style.position = "fixed";
        backdrop.style.top = "0";
        backdrop.style.left = "0";
        backdrop.style.width = "100vw";
        backdrop.style.height = "100vh";
        backdrop.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Ajuste a opacidade se quiser mais claro/escuro
        backdrop.style.zIndex = "998"; // Deve ficar abaixo do drawer (garanta que o drawer tenha z-index: 999)
        backdrop.style.opacity = "0";
        backdrop.style.visibility = "hidden";
        backdrop.style.transition = "opacity 0.4s ease, visibility 0.4s ease";
        
        document.body.appendChild(backdrop);
    }

    // Garante z-index no drawer para ficar acima do backdrop
    const drawerZIndex = window.getComputedStyle(drawer).zIndex;
    if (drawerZIndex === 'auto' || Number(drawerZIndex) < 999) {
        drawer.style.zIndex = "999";
    }

    // Criação dinâmica do botão de bloqueio (cadeado)
    let lockBtn = document.getElementById("footerLockBtn");
    if (!lockBtn) {
        lockBtn = document.createElement("button");
        lockBtn.id = "footerLockBtn";
        lockBtn.className = "footer-lock-btn";
        lockBtn.setAttribute("type", "button");
        lockBtn.setAttribute("aria-label", "Fixar ou desfixar aba");
        lockBtn.innerHTML = '<ion-icon name="lock-open-outline"></ion-icon>';
        drawer.appendChild(lockBtn);
    }

    // Função para alinhar a altura do cadeado EXATAMENTE com a aba de resumo
    function alinharCadeadoComTitulo() {
        if (toggleBtn && lockBtn) {
            const topOffset = toggleBtn.offsetTop;
            const height = toggleBtn.offsetHeight;
            lockBtn.style.top = `${topOffset + (height / 2)}px`;
        }
    }

    alinharCadeadoComTitulo();
    window.addEventListener('resize', alinharCadeadoComTitulo);

    let isLocked = false;

    if (lockBtn) {
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isLocked = !isLocked;
            if (isLocked) {
                lockBtn.classList.add("locked");
                lockBtn.innerHTML = '<ion-icon name="lock-closed-outline"></ion-icon>';
                openDrawer(true);
            } else {
                lockBtn.classList.remove("locked");
                lockBtn.innerHTML = '<ion-icon name="lock-open-outline"></ion-icon>';
            }
        });
    }

    let startY = 0;
    let startPosition = 0;
    let currentPosition = 0;
    let drawerHeight = 0;
    let isDragging = false;
    let isOpen = false;

    function updateHeight() {
        drawerHeight = drawer.offsetHeight || 300;
        alinharCadeadoComTitulo();
    }

    updateHeight();
    currentPosition = drawerHeight;
    drawer.style.transform = `translateY(${drawerHeight}px)`;
    drawer.style.willChange = 'transform';

    function openDrawer(smooth = true) {
        updateHeight();
        isOpen = true;
        currentPosition = 0;
        
        drawer.style.transition = smooth ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
        drawer.style.transform = 'translateY(0)';
        drawer.classList.add('is-open');

        // Ativa o backdrop (bloqueia cliques no fundo)
        backdrop.style.visibility = "visible";
        backdrop.style.opacity = "1";
        
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeDrawer(smooth = true) {
        if (isLocked) return;

        updateHeight();
        isOpen = false;
        currentPosition = drawerHeight;

        drawer.style.transition = smooth ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
        drawer.style.transform = `translateY(${drawerHeight}px)`;
        drawer.classList.remove('is-open');

        // Desativa o backdrop (libera cliques no fundo)
        backdrop.style.opacity = "0";
        backdrop.style.visibility = "hidden";

        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            if (isOpen) {
                closeDrawer(true);
            } else {
                openDrawer(true);
            }
        });
    }

    function onDragStart(clientY) {
        if (isLocked) return;
        isDragging = true;
        startY = clientY;
        startPosition = isOpen ? 0 : drawerHeight;
        drawer.style.transition = 'none';
    }

    function onDragMove(clientY) {
        if (!isDragging || isLocked) return;
        
        const deltaY = clientY - startY;
        let newPos = startPosition + deltaY;

        if (newPos < 0) {
            newPos = newPos * 0.3; 
        }

        if (newPos > drawerHeight) {
            newPos = drawerHeight;
        }

        currentPosition = newPos;
        drawer.style.transform = `translateY(${currentPosition}px)`;
    }

    function onDragEnd() {
        if (!isDragging || isLocked) return;
        isDragging = false;

        updateHeight();
        
        const threshold = drawerHeight * 0.35;

        if (isOpen) {
            if (currentPosition > threshold) {
                closeDrawer(true);
            } else {
                openDrawer(true);
            }
        } else {
            if (currentPosition < drawerHeight - threshold) {
                openDrawer(true);
            } else {
                closeDrawer(true);
            }
        }
    }

    const targetInteraction = handle || drawer;

    targetInteraction.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            onDragStart(e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        onDragMove(e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        onDragEnd();
    }, { passive: true });

    targetInteraction.addEventListener('mousedown', (e) => {
        onDragStart(e.clientY);
        
        const onMouseMove = (moveEvent) => onDragMove(moveEvent.clientY);
        const onMouseUp = () => {
            onDragEnd();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    // Clicar no backdrop fecha o drawer (caso não esteja travado)
    backdrop.addEventListener('click', () => {
        if (isOpen && !isLocked) {
            closeDrawer(true);
        }
    });

    window.addEventListener('resize', () => {
        updateHeight();
        if (!isOpen) {
            currentPosition = drawerHeight;
            drawer.style.transform = `translateY(${drawerHeight}px)`;
        }
    });
});
