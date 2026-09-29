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

    
    // --- 'About Me' window
    const aboutIcon = document.getElementById('about-icon');
    const aboutWindow = document.getElementById('about-window');
    const closeAboutBtn = document.getElementById('close-about');

    // Open window when clicking the icon
    aboutIcon.addEventListener('click', () => {
        aboutWindow.style.display = 'flex'; // Usamos flex para respeitar o layout interno
        bringToFront(aboutWindow);
    });

    // Close button
    closeAboutBtn.addEventListener('click', () => {
        aboutWindow.style.display = 'none';
    });


    // --- 'Mail' window
    const mailIcon = document.getElementById('mail-icon');
    const mailWindow = document.getElementById('mail-window');
    const closeMailBtn = document.getElementById('close-mail');
    
    mailIcon.addEventListener('click', () => {
        mailWindow.style.display = 'flex';
        bringToFront(mailWindow);
    });
    
    closeMailBtn.addEventListener('click', () => {
        mailWindow.style.display = 'none';
    });
    
    // --- 'Settings' window
    const settingsIcon = document.getElementById('settings-icon');
    const settingsWindow = document.getElementById('settings-window');
    const closeSettingsBtn = document.getElementById('close-settings');
    
    settingsIcon.addEventListener('click', () => {
        settingsWindow.style.display = 'flex';
        bringToFront(settingsWindow);
    });
    
    closeSettingsBtn.addEventListener('click', () => {
        settingsWindow.style.display = 'none';
    });

    // --- 'Radio' window
    const radioIcon = document.getElementById('radio-icon');
    const radioWindow = document.getElementById('radio-window');
    const closeRadioBtn = document.getElementById('close-radio');
    
    radioIcon.addEventListener('click', () => {
        radioWindow.style.display = 'flex';
        bringToFront(radioWindow);
    });
    
    closeRadioBtn.addEventListener('click', () => {
        radioWindow.style.display = 'none';
    });
}