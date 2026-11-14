/* Imports */
import { loadSound, playSound } from "./audio-samples.js";

/* Initial loading of the UI sounds */
export function initUISounds() {
    loadSound('radio-switch', './audio/samples/ui/radio-switch.wav');
    loadSound('radio-btn-on', './audio/samples/ui/radio-btn-on.wav');
    loadSound('radio-btn-off', './audio/samples/ui/radio-btn-off.wav');
    loadSound('radio-startup', './audio/samples/ui/radio-startup.wav');
    
    let pressedMechanicalBtn = null;
    
    /* Mousedown listener */
    document.addEventListener('mousedown', (e) => {
        const soundElement = e.target.closest('[data-sound]');
        if (!soundElement) return;

        const soundType = soundElement.getAttribute('data-sound');

        /* Radio button behavior */
        if (soundType === 'radio-btn') {
            pressedMechanicalBtn = soundElement;
            playSound('radio-btn-off', { volume: 3.0, pitchVar: 50});
        } 

        /* Radio switch behavior */
        else if (soundType === 'radio-switch') {
            playSound('radio-switch', { volume: 1.5, pitchVar: 100});
        }
        
        /* Digital button behavior */
        else if (soundType === 'digital-btn') {
            playSound('digital-btn', {volume: 1.0, pitchVar: 50});
        }

    });

    /* Mouseup */
    window.addEventListener('mouseup', () => {
        if (pressedMechanicalBtn) {
            playSound('radio-btn-off', { volume: 3.0, pitchVar: 50 });
            pressedMechanicalBtn = null;
        }
    });

}