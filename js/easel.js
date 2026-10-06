/* Get audio context */
import { getAudioContext, getMasterBus } from './audio.js';

import { initSliders } from './sliders.js';

/* HTML configuration */
const oscConfigs = [
    { id: 'osc1', name: 'FUNDAMENTAL', min: 20, max: 2000, step: 0.1, default: 440, isMultiplier: false },
    { id: 'osc2', name: 'HARMONIC 2', min: 0.1, max: 10, step: 0.01, default: 2.0, isMultiplier: true },
    { id: 'osc3', name: 'HARMONIC 3', min: 0.1, max: 10, step: 0.01, default: 3.0, isMultiplier: true },
    { id: 'osc4', name: 'HARMONIC 4', min: 0.1, max: 10, step: 0.01, default: 4.0, isMultiplier: true },
    { id: 'osc5', name: 'HARMONIC 5', min: 0.1, max: 10, step: 0.01, default: 5.0, isMultiplier: true }
];

function renderOscillators() {
    const container = document.getElementById('easel-oscillators');
    container.innerHTML = '';

    oscConfigs.forEach(conf => {
        const unit = conf.isMultiplier ? 'x' : 'Hz'; 

        container.innerHTML += `
            <div class="easel-osc">
                <div style="font-size: 10px; margin-bottom: 5px;">${conf.name}</div>
                <button class="osc-toggle" id="${conf.id}-toggle">POWER</button>
                
                <div class="slider-group">
                    <input type="range" min="${conf.min}" max="${conf.max}" step="${conf.step}" value="${conf.default}" class="hslider osc-freq" id="${conf.id}-freq">
                    <output class="slider-value" for="${conf.id}-freq">${conf.default}${unit}</output>
                </div>

                <div class="slider-group">
                    <input type="range" min="0" max="1" step="0.01" value="0.0" class="hslider osc-gain" id="${conf.id}-gain">
                    <output class="slider-value" for="${conf.id}-gain">0.0</output>
                </div>
            </div>
        `;
    });
}



/* AUDIO --------------------------------------------------- */
/* Dictionary to store oscillator states */
const activeOscillators = {};

/* Initialization function */
export function initEasel() {
    /* Generate HTML and initialize sliders */
    renderOscillators();
    initSliders();

    /* Get power buttons */
    const powerBtn = document.querySelectorAll('.osc-toggle');

    powerBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const oscId = e.target.id.replace('-toggle', '');

            const ctx = getAudioContext();
            
            /* If osc is off, turn it on */
            if (!activeOscillators[oscId]) {
                /* Read fundamental frequency from osc1 */
                const fundamental = parseFloat(document.getElementById('osc1-freq').value);

                /* Reads freq and gain values for given oscillator */
                const freqValue = parseFloat(document.getElementById(`${oscId}-freq`).value);
                const gainValue = parseFloat(document.getElementById(`${oscId}-gain`).value);

                /* Determine the actual frequency if it's a harmonic */
                const finalFreq = (oscId === 'osc1') ? freqValue : fundamental * freqValue;

                /* Create sine oscillator and gain nodes */
                const oscNode = ctx.createOscillator();
                oscNode.type = 'sine';
                const gainNode = ctx.createGain();

                /* Initial setup */
                oscNode.frequency.value = finalFreq;
                gainNode.gain.value = gainValue;

                /* Osc -> Gain -> Master Bus */
                oscNode.connect(gainNode);
                const masterBus = getMasterBus();
                gainNode.connect(masterBus);

                /* Start oscillator */
                oscNode.start();

                /* Update state dictionary */
                activeOscillators[oscId] = { oscNode, gainNode };

                /* Visual feedback */
                e.target.textContent = 'ON';

                console.log(`Oscillator ${oscId} toggled: Freq = ${finalFreq}, Gain = ${gainValue}`);

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
        const currentValue = parseFloat(e.target.value);
        const oscId = e.target.id.replace('-freq', '');
        const ctx = getAudioContext();

        if (oscId === 'osc1') {
            /* If it's the fundamental oscillator, update its frequency... */
            if (activeOscillators['osc1']) {
                activeOscillators['osc1'].oscNode.frequency.setTargetAtTime(currentValue, ctx.currentTime, 0.015);
            }

            /* ... and also update all harmonics */
            Object.keys(activeOscillators).forEach(activeId => {
                if (activeId !== 'osc1') {
                    /* Get current multiplier */
                    const multiplier = parseFloat(document.getElementById(`${activeId}-freq`).value);
                    const newFreq = currentValue * multiplier;
                    
                    activeOscillators[activeId].oscNode.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.015);
                }
            });

        } else {
            /* If it's a harmonic, only change its own multiplier */
            if (activeOscillators[oscId]) {
                const fundamental = parseFloat(document.getElementById('osc1-freq').value);
                const newFreq = fundamental * currentValue;
                
                activeOscillators[oscId].oscNode.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.015);
            }
        }
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