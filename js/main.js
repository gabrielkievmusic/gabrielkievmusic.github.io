const bootScreen = document.getElementById('boot-screen');
const desktop = document.getElementById('desktop');

const OSversion = 'v0.1.0';
const bootMessages = [  
    'GKM BIOS ' + OSversion + ' Copyright © 2026',
    '|-----------------------------',
    '|Initializing system...',
    '|Mounting file system... [OK]',
    '|',
    '|Initializing sound card...',
    '|Loading audio drivers...',
    '|Loading synthesizer modules...',
    '|Loading effects modules...',
    '|Loading simulations...',
    '|',
    '|Establishing network connection.',
    '|Establishing network connection..',
    '|Establishing network connection... [OK]',
    '|Loading info files...',
    '|Mounting contact protocols...',
    '|Checking for updates...',
    '|Portfolio loaded successfully.',
    '|',
    '|Loading desktop environment...',
    '|Starting Graphical User Interface...',
    '|All systems operational. Welcome to GKM OS ' + OSversion + '!'
];
const bootTransitionScreen = document.getElementById('boot-transition');
const terminalOutput = document.getElementById('terminal-output');

function typeTerminalOutput(index) {
    if (index >= bootMessages.length) {
        setTimeout(initializeOS, 666);
        return;
    }

    // New line
    const line = document.createElement('p');
    line.textContent = bootMessages[index];
    terminalOutput.appendChild(line);

    // Random delay time [25, 200]ms
    const delay = Math.random() * 175 + 25; 
    
    // Call next line
    setTimeout(() => typeTerminalOutput(index + 1), delay);
}

function initializeBoot() {
    bootScreen.style.display = 'none';
    bootTransitionScreen.style.display = 'block';
    typeTerminalOutput(0);
}

function initializeOS() {
    bootTransitionScreen.style.display = 'none';
    desktop.style.display = 'grid';
    desktop.classList.add('crtSwitch');
}

bootScreen.addEventListener('click', initializeBoot);

// 'About Me' window
const aboutIcon = document.getElementById('about-icon');
const aboutWindow = document.getElementById('about-window');
const closeAboutBtn = document.getElementById('close-about');

// Open window when clicking the icon
aboutIcon.addEventListener('click', () => {
    aboutWindow.style.display = 'flex'; // Usamos flex para respeitar o layout interno
});

// Close button
closeAboutBtn.addEventListener('click', () => {
    aboutWindow.style.display = 'none';
});