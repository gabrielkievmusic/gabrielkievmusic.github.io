/* Imports */
import { getAudioContext, getMasterBus } from './audio.js';

/* Dictionary with sound files loaded in RAM */
const audioBuffers = {};

/* Loads a sound file */
export async function loadSound(name, url) {
    const ctx = getAudioContext();
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBuffers[name] = audioBuffer;
        console.log(`Sound '${name}' loaded succesfully.`);
    } catch (error) {
        console.error(`Error loading sound '${name}':`, error);
    }
}

/* Plays a sound file */
// options: { volume: 1.0, pitchVar: 0, volVar: 0 }
export function playSound(name, options = {}) {
    const buffer = audioBuffers[name];
    if (!buffer) return;

    const ctx = getAudioContext();
    const baseVolume = options.volume !== undefined ? options.volume : 0.8;
    const pitchVar = options.pitchVar || 0;
    const volVar = options.volVar || 0;

    // Player
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Random modulation of pitch and volume
    const randomDetune = (Math.random() * pitchVar) - (pitchVar / 2);
    const randomVolume = baseVolume + (Math.random() * volVar) - (volVar / 2);
    
    // Apply detune
    if (source.detune) {
        source.detune.value = randomDetune;
    }
    
    // Create gain and apply volume variation
    const gainNode = ctx.createGain();
    gainNode.gain.value = Math.max(0, randomVolume);
    
    // Source -> Gain -> Master Bus
    source.connect(gainNode);
    gainNode.connect(getMasterBus());
    source.start(0);
}

