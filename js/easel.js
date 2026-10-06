/* Get audio context */
import { getAudioContext } from './audio.js';

/* Dictionary to store oscillator states */
const activeOscillators = {};

/* Initialization function */
export function initEasel() {
    /* Get power buttons */
    const powerBtn = document.querySelectorAll('.osc-toggle');

    powerBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const oscId = e.target.id.replace('-toggle', '');

            const ctx = getAudioContext();
            
            /* If osc is off, turn it on */
            if (!activeOscillators[oscId]) {
                /* Reads freq and gain values for given oscillator */
                const freqValue = parseFloat(document.getElementById(`${oscId}-freq`).value);
                const gainValue = parseFloat(document.getElementById(`${oscId}-gain`).value);

                /* Create sine oscillator and gain nodes */
                const oscNode = ctx.createOscillator();
                oscNode.type = 'sine';
                const gainNode = ctx.createGain();

                /* Initial setup */
                oscNode.frequency.value = freqValue;
                gainNode.gain.value = gainValue;

                /* Osc -> Gain -> Destination */
                oscNode.connect(gainNode);
                gainNode.connect(ctx.destination);

                /* Start oscillator */
                oscNode.start();

                /* Update state dictionary */
                activeOscillators[oscId] = { oscNode, gainNode };

                /* Visual feedback */
                e.target.textContent = 'ON';

                console.log(`Oscillator ${oscId} toggled: Freq = ${freqValue}, Gain = ${gainValue}`);

            } else {
                /* If osc is on, turn it off */
                /* Get nodes */
                const { oscNode, gainNode } = activeOscillators[oscId];

                /* Stops sound and disconnects nodes */
                oscNode.stop();
                oscNode.disconnect();
                gainNode.disconnect();

                /* Deletes from dictionary */
                delete activeOscillators[oscId];

                /* Visual feedback */
                e.target.textContent = 'OFF';

                console.log(`Oscillator ${oscId} toggled OFF`);
            }            
        });
    });

    /* Get oscillator freqs */
    const oscFreqSliders = document.querySelectorAll('.osc-freq');

    oscFreqSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const currentValue = e.target.value;
            const oscId = e.target.id.replace('-freq', '');

            /* If oscillator is active, update its frequency */
            if (activeOscillators[oscId]) {
                const ctx = getAudioContext();
                const oscNode = activeOscillators[oscId].oscNode;

                oscNode.frequency.setTargetAtTime(currentValue, ctx.currentTime, 0.02);
            }

            console.log(`Oscillator ${oscId} frequency changed to: ${currentValue}`);
        });
    });

    /* Get oscillator gains */
    const oscGainSliders = document.querySelectorAll('.osc-gain');

    oscGainSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const currentValue = e.target.value;
            const oscId = e.target.id.replace('-gain', '');

            /* If oscillator is active, update its gain */
            if (activeOscillators[oscId]) {
                const ctx = getAudioContext();
                const gainNode = activeOscillators[oscId].gainNode;

                gainNode.gain.setTargetAtTime(currentValue, ctx.currentTime, 0.02);
            }

            console.log(`Oscillator ${oscId} gain changed to: ${currentValue}`);
        });
    });
}