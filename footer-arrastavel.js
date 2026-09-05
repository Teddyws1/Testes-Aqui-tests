//////////////////////////////////////
//
// -294pq CICLO DO FOOTER — ARRASTE VERTICAL  
//
/////////////////////////////////////

// •108Fd FECHAMENTO INSTANTÂNEO AO ARRASTAR PARA BAIXO

document.addEventListener("DOMContentLoaded", () => {

    const drawer =
        document.getElementById("footer-drawer");

    const handle =
        document.getElementById("footer-drag-handle");

    if (!drawer || !handle) return;


    let startY = 0;
    let startPosition = 0;
    let currentPosition = 0;

    let drawerHeight = 0;
    let dragging = false;
    let closedByDrag = false;


    // •109Bl VERIFICAR MODAL OU ABA LATERAL

    function isBlocked() {

        const modal =
            document.querySelector(
                ".modal-overlay.active, " +
                ".modal.active, " +
                ".image-modal-overlay.active"
            );

        const sidebar =
            document.querySelector(
                "#sidebar.active, " +
                ".sidebar.active"
            );

        return !!modal || !!sidebar;
    }


    // •110Fc FECHAR FOOTER INSTANTANEAMENTE

    function closeFooterInstant() {

        updateHeight();

        currentPosition = drawerHeight;

        drawer.style.transition = "none";

        drawer.style.transform =
            `translateY(${drawerHeight}px)`;

        closedByDrag = true;
        dragging = false;

    }


    // •111Uh ATUALIZAR ALTURA

    function updateHeight() {

        drawerHeight =
            drawer.offsetHeight;

    }


    // •112Ps DEFINIR POSIÇÃO

    function setPosition(position) {

        currentPosition =
            Math.max(
                0,
                Math.min(
                    drawerHeight,
                    position
                )
            );

        drawer.style.transform =
            `translateY(${currentPosition}px)`;

    }


    // •113St INICIAR ARRASTE

    function startDrag(event) {

        if (event.touches.length !== 1) {
            return;
        }

        if (isBlocked()) {

            closeFooterInstant();

            return;

        }

        updateHeight();

        startY =
            event.touches[0].clientY;

        startPosition =
            currentPosition;

        closedByDrag = false;

        dragging = true;

        drawer.style.transition =
            "none";

    }


    // •114Mv ACOMPANHAR MOVIMENTO

    function moveDrag(event) {

        if (!dragging) return;

        if (isBlocked()) {

            closeFooterInstant();

            return;

        }


        const fingerY =
            event.touches[0].clientY;

        const difference =
            fingerY - startY;


        /*
         * APENAS 5PX PARA BAIXO
         * FECHA IMEDIATAMENTE.
         */

        if (difference >= 5) {

            closeFooterInstant();

            return;

        }


        /*
         * Movimento normal para cima.
         */

        setPosition(
            startPosition + difference
        );

    }


    // •115Ed FINALIZAR ARRASTE

    function endDrag() {

        if (!dragging) return;

        dragging = false;


        if (closedByDrag) {
            return;
        }


        if (isBlocked()) {

            closeFooterInstant();

            return;

        }


        drawer.style.transition =
            "transform 0.12s ease-out";

        setPosition(currentPosition);

    }


    // •116Ts EVENTOS DE TOQUE

    handle.addEventListener(
        "touchstart",
        startDrag,
        { passive: true }
    );


    handle.addEventListener(
        "touchmove",
        moveDrag,
        { passive: true }
    );


    handle.addEventListener(
        "touchend",
        endDrag,
        { passive: true }
    );


    handle.addEventListener(
        "touchcancel",
        endDrag,
        { passive: true }
    );


    // •117Ob OBSERVAR MODAIS E SIDEBAR

    const observer =
        new MutationObserver(() => {

            if (isBlocked()) {

                closeFooterInstant();

            }

        });


    observer.observe(
        document.body,
        {
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        }
    );


    // •118Rs REDIMENSIONAMENTO

    window.addEventListener(
        "resize",
        () => {

            updateHeight();

            if (currentPosition > drawerHeight) {

                currentPosition =
                    drawerHeight;

                drawer.style.transform =
                    `translateY(${drawerHeight}px)`;

            }

        }
    );


    // •119Out DETECTOR DE TOQUE FORA DA TELA

    function handleOutsideTouch(event) {

        // Se o footer já estiver completamente fechado, não faz nada
        if (currentPosition >= drawerHeight) return;

        // Verifica se o toque ocorreu fora do elemento drawer
        if (!drawer.contains(event.target)) {

            closeFooterInstant();

        }

    }

    // Suporte para dispositivos mobile (touchstart) e desktop (click)
    document.addEventListener("touchstart", handleOutsideTouch, { passive: true });
    document.addEventListener("click", handleOutsideTouch);


    // •120In INICIAR 100% ESCONDIDO

    updateHeight();

    currentPosition =
        drawerHeight;

    drawer.style.transform =
        `translateY(${drawerHeight}px)`;

});
