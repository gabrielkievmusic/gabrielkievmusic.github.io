/* Imports */
import { bringToFront } from './windows.js';

export function initRadio() {
    const radioIcon = document.getElementById('radio-icon');
    const radioWidget = document.getElementById('radio-widget');
    const radioTop = radioWidget.querySelector('.radio-top-section');

    const bandSwitch = radioWidget.querySelector('#band-switch');
    const fmLabel = radioWidget.querySelector('.band-label:nth-child(1)');
    const amLabel = radioWidget.querySelector('.band-label:nth-child(2)');


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
}