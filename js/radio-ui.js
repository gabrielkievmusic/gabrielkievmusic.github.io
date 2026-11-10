/* Imports */
import { bringToFront } from './windows.js';

export function initRadio() {
    const radioIcon = document.getElementById('radio-icon');
    const radioWidget = document.getElementById('radio-widget');
    const radioTop = radioWidget.querySelector('.radio-top-section');

    const bandSwitch = radioWidget.querySelector('#band-switch');
    const fmLabel = radioWidget.querySelector('.band-label:nth-child(1)');
    const amLabel = radioWidget.querySelector('.band-label:nth-child(2)');

    const volInput = radioWidget.querySelector('.radio-volume-input');

    if (!radioIcon || !radioWidget) return;

    /* Z-Index */
    radioWidget.addEventListener('mousedown', () => bringToFront(radioWidget));

    /* Open widget */
    radioIcon.addEventListener('click', () => {
        radioWidget.style.display = 'flex';
        radioWidget.classList.remove('radio-minimized');
        bringToFront(radioWidget);
    });

    /* Close vs minimize */
    radioTop.addEventListener('click', () => {
        const isPoweredOn = radioWidget.classList.contains('is-powered-on');

        if (isPoweredOn) {
            radioWidget.classList.toggle('radio-minimized');
        } else {
            radioWidget.style.display = 'none';
            radioWidget.classList.remove('radio-minimized');
        }
    });


    /* User guide button */
    const infoBtn = radioWidget.querySelector('.info-btn');
    console.log(`Info button acquired: ${infoBtn}`)
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            if (!radioWidget.classList.contains('is-powered-on')) return;

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

    
    /* Volume + Power */
    if (volInput) {
        volInput.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);

            if (volume > 0.05) {
                if (!radioWidget.classList.contains('is-powered-on')) {
                    radioWidget.classList.add('is-powered-on');
                    // TODO: PLAY MUSIC
                }
                // TODO: SET MUSIC VOLUME
            } else {
                if (radioWidget.classList.contains('is-powered-on')) {
                    radioWidget.classList.remove('is-powered-on');
                    // TODO: SET VOLUME 0 + STOP MUSIC
                }
            }
        });
    }


    /* AM/FM Selector */
    if (bandSwitch && fmLabel && amLabel) {
        bandSwitch.addEventListener('click', () => {
            const isAM = bandSwitch.classList.toggle('is-am');

            if (isAM) {
                fmLabel.classList.remove('active');
                amLabel.classList.add('active');
            } else {
                amLabel.classList.remove('active');
                fmLabel.classList.add('active');
            }

            // TODO - Change band functionality
        });
    }


    /* Needle position */
    const tuneInput = radioWidget.querySelector('.radio-freq-input');
    const needle = radioWidget.querySelector('.dial-needle');


    if (tuneInput && needle) {
        tuneInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const min = parseFloat(e.target.min);
            const max = parseFloat(e.target.max);

            const progress = (val - min) / (max - min);
            let percent = progress * 100;
            // Clamp to fit glass
            percent = Math.max(2, Math.min(98, percent));

            needle.style.left = `${percent}%`;

        });
    }
}