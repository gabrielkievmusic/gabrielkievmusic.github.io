export function initWindows() {
    // Z-Index logic
    let highestZIndex = 10;
    
    function bringToFront(windowElement) {
        highestZIndex++;
        windowElement.style.zIndex = highestZIndex;
    }

    const allWindows = document.querySelectorAll('.window');
    allWindows.forEach(win => {
        win.addEventListener('mousedown', () => bringToFront(win));
    });


    // Window opening/closing logic
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
        // Gets program name
        const appName = icon.id.replace('-icon', '');

        // Gets elements by naming convention
        const win = document.getElementById(`${appName}-window`);
        const closeBtn = document.getElementById(`close-${appName}`);

        // Null case
        if (!win || !closeBtn) return;

        // Listeners
        icon.addEventListener('click', () => {
            win.style.display = 'flex';
            bringToFront(win);
        });
        closeBtn.addEventListener('click', () => {
            win.style.display = 'none';
        });
    });


}