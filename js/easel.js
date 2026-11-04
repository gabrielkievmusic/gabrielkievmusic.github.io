/* Get audio context */
import { getAudioContext, getMasterBus, createReverbEffect } from './audio.js';



/* HTML configuration -------------------------------------- */
const oscConfigs = [
    { id: 'osc1', name: 'FUNDAMENTAL', min: 20, max: 2000, step: 0.1, default: 440, isMultiplier: false, fineMin: -10, fineMax: 10, fineStep: 0.1 },
    { id: 'osc2', name: 'HARMONIC 2', min: 0.1, max: 5, step: 0.01, default: 2.0, isMultiplier: true, fineMin: -1, fineMax: 1, fineStep: 0.01 },
    { id: 'osc3', name: 'HARMONIC 3', min: 0.1, max: 5, step: 0.01, default: 3.0, isMultiplier: true, fineMin: -1, fineMax: 1, fineStep: 0.01 },
    { id: 'osc4', name: 'HARMONIC 4', min: 0.1, max: 5, step: 0.01, default: 4.0, isMultiplier: true, fineMin: -1, fineMax: 1, fineStep: 0.01 },
    { id: 'osc5', name: 'HARMONIC 5', min: 0.1, max: 5, step: 0.01, default: 5.0, isMultiplier: true, fineMin: -1, fineMax: 1, fineStep: 0.01 }
];

function renderOscillators() {
    const container = document.getElementById('easel-oscillators');
    container.innerHTML = '';

    oscConfigs.forEach(conf => {
        const unit = conf.isMultiplier ? 'x' : 'Hz'; 

        container.innerHTML += /* html */ `
            <div class="easel-osc">
                <!-- Power button -->
                <div class="button-group">
                    <button class="square-toggle easel-power-btn" id="${conf.id}-toggle" data-active="false"></button>
                    <label class="button-label" for="${conf.id}-toggle">POWER</label>
                </div>

                <!-- Phase button -->
                <div class="button-group">
                    <button class="square-toggle easel-phase-btn" id="${conf.id}-phase" data-active="false"></button>
                    <label class="button-label" for="${conf.id}-phase">PHASE</label>
                </div>

                <!-- <div class="slider-group">
                    <input type="range" min="${conf.min}" max="${conf.max}" step="${conf.step}" value="${conf.default}" class="hslider osc-freq" id="${conf.id}-freq">
                    <output class="slider-value" for="${conf.id}-freq">${conf.default}${unit}</output>
                </div> -->

                <!-- Freq knob container -->
                <div class="ui-knob-container">
                    <!-- Freq knob -->
                    <div class="ui-knob-group">
                        <output class="knob-value" for="${conf.id}-freq" data-unit="${unit}">${conf.default}</output>
    
                        <div class="ui-knob">
                            <div class="knob-dial">
                                <div class="knob-pointer"></div>
                            </div>
                        </div>
    
                        <input type="range" min="${conf.min}" max="${conf.max}" step="${conf.step}" value="${conf.default}" class="hslider osc-freq hidden-input" id="${conf.id}-freq">
                        <label for="${conf.id}-freq" class="knob-label">FREQ.</label>
                    </div>

                    <!-- Freq fine knob -->
                    <div class="ui-knob-group">
                        
                        <div class="ui-knob-small">
                            <div class="knob-dial">
                                <div class="knob-pointer"></div>
                            </div>
                        </div>
                        
                        <label for="${conf.id}-freq-fine" class="knob-label-small">FINE</label>
                        <input type="range" min="${conf.fineMin}" max="${conf.fineMax}" step="${conf.fineStep}" value="0.0" class="hslider osc-freq-fine hidden-input" id="${conf.id}-freq-fine">
                    </div>

                    <!-- Freq CV depth knob -->
                    <div class="ui-knob-group">
                        
                        <div class="ui-knob-small">
                            <div class="knob-dial">
                                <div class="knob-pointer"></div>
                            </div>
                        </div>
                        
                        <label for="${conf.id}-freq-cv-depth" class="knob-label-small">MOD</label>
                        <input type="range" min="0" max="1" step="0.01" value="0.0" class="hslider osc-freq-cv-depth hidden-input" id="${conf.id}-freq-cv-depth">
                    </div>

                    <!-- Freq CV rate knob -->
                    <div class="ui-knob-group">
                        
                        <div class="ui-knob-small">
                            <div class="knob-dial">
                                <div class="knob-pointer"></div>
                            </div>
                        </div>
                        
                        <label for="${conf.id}-freq-cv-rate" class="knob-label-small">RATE</label>
                        <input type="range" min="0" max="20" step="0.01" value="0.0" class="hslider osc-freq-cv-rate hidden-input" id="${conf.id}-freq-cv-rate">
                    </div>
                </div>

                <!-- <div class="slider-group">
                    <input type="range" min="0" max="1" step="0.01" value="0.0" class="hslider osc-gain" id="${conf.id}-gain">
                    <output class="slider-value" for="${conf.id}-gain">0.0</output>
                </div> -->

                <!-- Gain knob container -->
                <div class="ui-knob-container">

                    <!-- Gain knob -->
                    <div class="ui-knob-group">
                        <div class="ui-knob">
                            <div class="knob-dial">
                                <div class="knob-pointer"></div>
                            </div>
                        </div>
    
                        <input type="range" min="0" max="1" step="0.01" value="0.0" class="hslider osc-gain hidden-input" id="${conf.id}-gain">
                        <label for="${conf.id}-gain" class="knob-label">GAIN</label>
                    </div>
    
                    <!-- Gain CV depth knob -->
                        <div class="ui-knob-group">
                            
                            <div class="ui-knob-small">
                                <div class="knob-dial">
                                    <div class="knob-pointer"></div>
                                </div>
                            </div>
                            
                            <label for="${conf.id}-gain-cv-depth" class="knob-label-small">MOD</label>
                            <input type="range" min="0" max="1" step="0.01" value="0.0" class="hslider osc-gain-cv-depth hidden-input" id="${conf.id}-gain-cv-depth">
                        </div>
    
                        <!-- Gain CV rate knob -->
                        <div class="ui-knob-group">
                            
                            <div class="ui-knob-small">
                                <div class="knob-dial">
                                    <div class="knob-pointer"></div>
                                </div>
                            </div>
                            
                            <label for="${conf.id}-gain-cv-rate" class="knob-label-small">RATE</label>
                            <input type="range" min="0" max="20" step="0.01" value="0.0" class="hslider osc-gain-cv-rate hidden-input" id="${conf.id}-gain-cv-rate">
                        </div>
                </div>


            </div>
        `;
    });
}



/* AUDIO --------------------------------------------------- */
/* Dictionary to store oscillator states */
const activeOscillators = {};

/* Reverb state */
let easelReverb = null;


export const easelState = {
    // Starting values
    osc1: { freq: 440 }, 
    osc2: { freq: 2.0 },
    osc3: { freq: 3.0 },
    osc4: { freq: 4.0 },
    osc5: { freq: 5.0 }
};

/* Helper function to combine Coarse and Fine values */
function getOscCombinedValue(oscId) {
    const coarseInput = document.getElementById(`${oscId}-freq`);
    const fineInput = document.getElementById(`${oscId}-freq-fine`);
    
    let total = 0;
    if (coarseInput) total += parseFloat(coarseInput.value);
    if (fineInput) total += parseFloat(fineInput.value);
    
    // Salva o resultado matematicamente pronto na memória!
    easelState[oscId].freq = total; 
    
    return total;
}

/* Initialization function */
export function initEasel() {
    /* Generate HTML and initialize sliders */
    renderOscillators();

    /* Get power buttons */
    const powerBtn = document.querySelectorAll('.easel-power-btn');

    powerBtn.forEach(btn => {
        btn.addEventListener('toggleChange', (e) => {
            const oscId = e.target.id.replace('-toggle', '');

            const ctx = getAudioContext();
            
            /* If osc is off, turn it on */
            if (!activeOscillators[oscId]) {
                /* Read fundamental frequency from osc1 */
                const fundamental = getOscCombinedValue('osc1');

                /* Reads freq and gain values for given oscillator */
                const freqValue = getOscCombinedValue(oscId);
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

                /* Osc -> Gain -> Reverb */
                oscNode.connect(gainNode);
                gainNode.connect(easelReverb.input);

                /* Start oscillator */
                oscNode.start();

                /* Update state dictionary */
                activeOscillators[oscId] = { oscNode, gainNode };

                console.log(`Oscillator ${oscId} toggled ON: Freq = ${finalFreq}, Gain = ${gainValue}`);

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

                console.log(`Oscillator ${oscId} toggled OFF`);
            }            
        });
    });

    /* Get oscillator freqs (Coarse and Fine) */
    const oscFreqSliders = document.querySelectorAll('.osc-freq, .osc-freq-fine');

    oscFreqSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            // Get id and context
            const oscId = e.target.id.split('-')[0];
            const ctx = getAudioContext();

            // Calculate combined value (coarse + fine)
            const currentValue = getOscCombinedValue(oscId);
            
            // Update the output display
            const output = document.querySelector(`.knob-value[for="${oscId}-freq"]`);
            if (output) {
                const coarseInput = document.getElementById(`${oscId}-freq`);
                const stepStr = coarseInput.getAttribute('step') || '1';
                const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
                output.textContent = currentValue.toFixed(decimals);
            }

            if (oscId === 'osc1') {
                /* If it's the fundamental oscillator, update its frequency... */
                if (activeOscillators['osc1']) {
                    activeOscillators['osc1'].oscNode.frequency.setTargetAtTime(currentValue, ctx.currentTime, 0.015);
                }

                /* ... and also update all harmonics */
                Object.keys(activeOscillators).forEach(activeId => {
                    if (activeId !== 'osc1') {
                        /* Get current multiplier */
                        const multiplier = getOscCombinedValue(activeId);;
                        const newFreq = currentValue * multiplier;
                        
                        activeOscillators[activeId].oscNode.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.015);
                    }
                });

            } else {
                /* If it's a harmonic, only change its own multiplier */
                if (activeOscillators[oscId]) {
                    const fundamental = getOscCombinedValue('osc1');
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

            //console.log(`Oscillator ${oscId} gain changed to: ${currentValue}`);
        });
    });

    /* Create reverb */
    const ctx = getAudioContext();
    const masterBus = getMasterBus();

    if(!easelReverb) {
        easelReverb = createReverbEffect(ctx, 3.0, 3.0);
        easelReverb.output.connect(masterBus);
    }
}