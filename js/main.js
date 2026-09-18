const bootScreen = document.getElementById('boot-screen');
const desktop = document.getElementById('desktop');

function initializeOS() {
    bootScreen.style.display = 'none';
    desktop.style.display = 'block';
}

bootScreen.addEventListener('click', initializeOS);