/* Imports */
import { loadSound, playSound } from "./audio-samples.js";

/* Initial loading of the UI sounds */
export function initUISounds() {
    loadSound('radio-switch', './audio/samples/ui/radio-switch.wav');
    loadSound('radio-btn-on', './audio/samples/ui/radio-btn-on.wav');
    loadSound('radio-btn-off', './audio/samples/ui/radio-btn-off.wav');
    loadSound('radio-startup', './audio/samples/ui/radio-startup.wav');
    loadSound('radio-chassis-click', './audio/samples/ui/radio-chassis-click.wav');
    loadSound('radio-glass', './audio/samples/ui/radio-glass-click.wav');
    loadSound('default-click', './audio/samples/ui/default-click.wav');


    
    let pressedMechanicalBtn = null;
    
    /* Mousedown listener */
    document.addEventListener('mousedown', (e) => {
        const soundElement = e.target.closest('[data-sound]');
        
        /* If no sound category, play generic click */
        if (!soundElement) {
            playSound('default-click', {volume: 2.0, pitchVar: 20});
            return;
        }

        const soundType = soundElement.getAttribute('data-sound');

        /* If sound category is 'mute', play no sound and return */
        if (soundType === 'mute') {
            return;
        }

        /* Radio button behavior */
        if (soundType === 'radio-btn') {
            pressedMechanicalBtn = soundElement;
            playSound('radio-btn-off', { volume: 5.0, pitchVar: 50});
        } 

        /* Radio switch behavior */
        else if (soundType === 'radio-switch') {
            playSound('radio-switch', { volume: 3.0, pitchVar: 200});
        }

        /* Radio glass */
        else if (soundType === 'radio-glass') {
            playSound('radio-glass', {volume: 1.0, pitchVar: 300});
        }

        /* Click on the radio chassis */
        else if (soundType === 'radio-chassis-click') {
            playSound('radio-chassis-click', {volume: 0.6, pitchVar: 50});
        }
        
        /* Digital button behavior */
        else if (soundType === 'digital-btn') {
            playSound('digital-btn', {volume: 1.0, pitchVar: 50});
        }

    });

    /* Mouseup */
    window.addEventListener('mouseup', () => {
        if (pressedMechanicalBtn) {
            playSound('radio-btn-off', { volume: 5.0, pitchVar: 50 });
            pressedMechanicalBtn = null;
        }
    });

}