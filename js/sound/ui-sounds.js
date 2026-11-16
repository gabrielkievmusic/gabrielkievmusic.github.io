/* Imports */
import { loadSound, playSound } from "../sound/audio-samples.js";
import { getAudioContext, getMasterBus, createReverbEffect, getUIBus } from "../sound/audio.js";

/* --- GENERATIVE ICON HOVERING --- */
/* SCALE */
// Auxiliary function to convert MIDI to Hz
function midiToHz(midiNote) {
    return 440 * Math.pow(2, (midiNote-69) / 12);
}

// Function to update scale with input from settings menu
export function updateSystemScale(newRootMidi, newIntervals) {
    rootMidiNote = newRootMidi;
    currentScaleIntervals = newIntervals;
    scaleFrequencies = [];

    const hoverRootMidi = rootMidiNote + 36;  // Hover sounds 3 octaves up from drone

    // Create frequencies in 2 octaves
    [0, 12]. forEach(octaveOffset => {
        currentScaleIntervals.forEach(interval => {
            const noteMidi = hoverRootMidi + interval + octaveOffset;
            scaleFrequencies.push(midiToHz(noteMidi));
        });
    });

    console.log("Scale system updated, frequencies generated:", scaleFrequencies);
}

// Default scale setup
let rootMidiNote = 36;  // C2
let currentScaleIntervals = [0, 2, 4, 7, 9];  // Pentatonic Major
let scaleFrequencies = [];  // in Hz
// Initialize default scale
updateSystemScale(rootMidiNote, currentScaleIntervals);

/* SOUND SYNTHESIS */
// Map the active hover sound to corresponding icon
const activeHovers = new Map();

// Parameters
let hoverAttack = 0.2;  // 200ms
let hoverRelease = 0.8;  // 800ms
let hoverReverb = null

// Function to play a hover tone with a random frequency in the given scale when hovering an element
function playHoverTone(element) {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Pick random values
    const randomFreq = scaleFrequencies[Math.floor(Math.random() * scaleFrequencies.length)];
    const randomLFOFreq = 2.0 + Math.random()*2.0;

    // Create hover oscillator
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = randomFreq;
    
    // Create hover gain
    const gain = ctx.createGain();
    // Create hover filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value =  100;
    // Create filter LFO
    const filterLFO = ctx.createOscillator();
    filterLFO.type = 'sine';
    filterLFO.frequency.value = randomLFOFreq;
    // Create LFO Depth gain
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0;
    // filterLFO -> lfoDepth -> Filter cutoff
    filterLFO.connect(lfoDepth);
    lfoDepth.connect(filter.frequency);
    // Create and connect reverb only on the first time
    if (!hoverReverb) {
        hoverReverb = createReverbEffect(ctx, 3.5, 2.5, 0.8);
        hoverReverb.output.connect(getUIBus());
    }

    /* Attack envelopes */
    const t = ctx.currentTime
    
    // Gain
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.1, t + hoverAttack);
    
    // Filter cutoff
    filter.frequency.setValueAtTime(100, t);
    filter.frequency.linearRampToValueAtTime(600, t + hoverAttack);

    // Filter LFO depth
    lfoDepth.gain.setValueAtTime(0, t + (hoverAttack * 2));
    lfoDepth.gain.linearRampToValueAtTime(100, t + (hoverAttack * 2) + 0.5);

    // Hover osc -> Filter -> Hover gain -> Reverb bus
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(hoverReverb.input);

    osc.start();
    filterLFO.start();

    // Store current active oscillator and corresponding element
    activeHovers.set(element, {osc, gain, filter, filterLFO});
}

// Function to stop a hover sound for when the mouse leaves the icon area
function stopHoverTone(element) {
    const synth = activeHovers.get(element);
    if (!synth) return;

    const ctx = getAudioContext();
    const { osc, gain, filter, filterLFO } = synth;
    const t = ctx.currentTime;

    /* Release envelopes */
    // Gain
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + hoverRelease);
    // Filter
    filter.frequency.cancelScheduledValues(t);
    filter.frequency.setValueAtTime(filter.frequency.value, t);
    filter.frequency.exponentialRampToValueAtTime(15000, t + (hoverRelease*0.4));
    // Disconnect oscillators
    osc.stop(t + hoverRelease);
    filterLFO.stop(t + hoverRelease);

    // Remove from memory
    activeHovers.delete(element);
}


/* --- INTIALIZATION --- */
export function initUISounds() {
    loadSound('radio-switch', './audio/samples/ui/radio-switch.wav');
    loadSound('radio-btn-on', './audio/samples/ui/radio-btn-on.wav');
    loadSound('radio-btn-off', './audio/samples/ui/radio-btn-off.wav');
    loadSound('radio-startup', './audio/samples/ui/radio-startup.wav');
    loadSound('radio-chassis-click', './audio/samples/ui/radio-chassis-click.wav');
    loadSound('radio-glass', './audio/samples/ui/radio-glass-click.wav');
    loadSound('default-click', './audio/samples/ui/default-click.wav');

    
    
    /* --- CLICKS --- */
    let pressedMechanicalBtn = null;

    // Mousedown listener
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
            playSound('radio-glass', {volume: 1.0, pitchVar: 200});
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

    // Mouseup
    window.addEventListener('mouseup', () => {
        if (pressedMechanicalBtn) {
            playSound('radio-btn-off', { volume: 5.0, pitchVar: 50 });
            pressedMechanicalBtn = null;
        }
    });


    /* --- ICON HOVERING --- */
    // Mouseover
    document.addEventListener('mouseover', (e) => {
        const hoverTarget = e.target.closest('[data-hover="generative"]');
        if (hoverTarget) {
            if (!activeHovers.has(hoverTarget)) {
                playHoverTone(hoverTarget);
            }
        }
    });

    // Mouseout
    document.addEventListener('mouseout', (e) => {
        const hoverTarget = e.target.closest('[data-hover="generative"]');
        if (hoverTarget) {
            if (!hoverTarget.contains(e.relatedTarget)) {
                stopHoverTone(hoverTarget);
            }
        }
    });

}