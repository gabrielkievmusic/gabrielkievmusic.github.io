// Z-Index logic    
export let highestZIndex = 10;
export function bringToFront(windowElement) {
    highestZIndex++;
    windowElement.style.zIndex = highestZIndex;

    // Sets as active window
    document.querySelectorAll('.window').forEach(w => {
        w.classList.remove('is-active-window');
    });
    windowElement.classList.add('is-active-window');
}

export function initWindows() {

    const allWindows = document.querySelectorAll('.window');
    allWindows.forEach(win => {
        win.addEventListener('mousedown', () => bringToFront(win));
    });


    // Window opening/closing logic + info button logic
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
        // Gets program name
        const appName = icon.id.replace('-icon', '');

        // Gets elements by naming convention
        const win = document.getElementById(`${appName}-window`);
        const closeBtn = document.getElementById(`close-${appName}`);
        const infoBtn = win ? win.querySelector('.info-btn') : null;

        // Null case
        if (!win || !closeBtn) return;

        /* Listeners */
        // Z-Index
        icon.addEventListener('click', () => {
            win.style.display = 'flex';
            bringToFront(win);
        });

        // Close button
        closeBtn.addEventListener('click', () => {
            win.style.display = 'none';
        });

        // Info button
        if (infoBtn) {
            infoBtn.addEventListener('click', () => {
                const guideWindow = document.getElementById('user-guide-window');
                if (!guideWindow) return;

                // Open User Guide and Bring to Front
                guideWindow.style.display = 'flex';
                bringToFront(guideWindow);

                // Get the target guide page via info button 'data-target' attribute or appName as a fallback
                const targetId = infoBtn.getAttribute('data-target') || `guide-${appName}`;

                // Selects the corresponding User Guide entry
                const tocItem = document.querySelector(`.toc-item[data-target="${targetId}"]`);
                if (tocItem) {
                    tocItem.click();
                } else {
                    console.warn(`Guide page not found for target ID "${targetId}"`);
                }
            });
        }

    });

    /* Initialize window drag functionality */
    initWindowDrag(allWindows);

}

function initWindowDrag(allWindows) {
    let activeWindow = null;
    let offsetX = 0;
    let offsetY = 0;

    allWindows.forEach(win => {
        const header = win.querySelector('.window-header');
        if (!header) return;

        /* Click header to start dragging */
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;

            e.preventDefault();  // to stop text selection

            activeWindow = win;

            /* Get coords */
            const style = window.getComputedStyle(win);
            const currentLeft = parseFloat(style.left)
            const currentTop = parseFloat(style.top)

            /* Calculate offset from click spot to window corner */
            offsetX = e.clientX - currentLeft;
            offsetY = e.clientY - currentTop;
        });
    });

    /* Mouse moving */
    document.addEventListener('mousemove', (e) => {
        if (!activeWindow) return;

        activeWindow.style.left = `${e.clientX - offsetX}px`
        activeWindow.style.top = `${e.clientY - offsetY}px`
    });

    /* Mouse released */
    document.addEventListener('mouseup', () => {
        if (activeWindow) {
            const header = activeWindow.querySelector('.window-header');
            activeWindow = null;
        }
    });

}