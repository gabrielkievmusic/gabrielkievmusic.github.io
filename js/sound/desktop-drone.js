/* Imports */
import { getAudioContext, getMasterBus } from "../audio.js";
import { PinkNoise } from "../random.js";

export class DesktopDrone {
    constructor(baseFrequency = 65.41) { // C2 = 65.41Hz
        this.baseFrequency = baseFrequency;
        this.ctx = null;
        this.isPlaying = false;
        this.generativeInterval = null;
    }

    /* Creates pink noise and fills buffer */
    createPinkNoiseBuffer(ctx) {
        const pinkGen = new PinkNoise();
        const bufferSize = ctx.sampleRate * 5; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = pinkGen.next();
        }
        return buffer; 
    }

    start() {
        if (this.isPlaying) return;
        this.ctx = getAudioContext();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        /* Master Gain */
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0;
        // Drone Gain -> Master Bus
        this.masterGain.connect(getMasterBus());

        /* Oscillators */
        this.osc1 = this.ctx.createOscillator();
        this.osc1.type = 'sine';
        this.osc2 = this.ctx.createOscillator();
        this.osc2.type = 'sine';
        // Osc frequencies
        this.osc1.frequency.value = this.baseFrequency;
        this.osc2.frequency.value = this.baseFrequency + 0.001;
        
        /* Filter */
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 300;
        this.filter.Q.value = 1.5;
        // Filter -> Master Gain
        this.filter.connect(this.masterGain);

        /* Oscillator gain */
        this.oscGain = this.ctx.createGain();
        this.oscGain.gain.value = 0.2;
        // Osc 1 & Osc 2 -> Osc gain -> Filter
        this.osc1.connect(this.oscGain);
        this.osc2.connect(this.oscGain);
        this.oscGain.connect(this.filter);

        /* Noise */
        this.noiseSource = this.ctx.createBufferSource();
        this.noiseSource.buffer = this.createPinkNoiseBuffer(this.ctx);
        this.noiseSource.loop = true;
        // Noise Gain
        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.value = 0.15;
        // Noise source -> Noise gain -> Filter
        this.noiseSource.connect(this.noiseGain);
        this.noiseGain.connect(this.filter);

        /* Start sound */
        this.osc1.start();
        this.osc2.start();
        this.noiseSource.start();

        /* Fade-in */
        this.masterGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 8.0);
        this.isPlaying = true;

        /* Generative modulation */
        this.startGenerativeModulation();
        
    }

    stop() {
        if (!this.isPlaying) return;
        
        /* Fade-out */
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 2.0);

        /* Clear generative loop */
        clearInterval(this.generativeInterval);
        this.isPlaying = false;

        /* Turn off nodes after fade-out*/
        setTimeout(() => {
            this.osc1.stop();
            this.osc2.stop();
            this.noiseSource.stop();
            this.masterGain.disconnect();
        }, 3000);
    }
    
    mute() {
        if (!this.isPlaying || this.isMuted) return;
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 2.0);
        this.isMuted = true;
    }

    unmute() {
        if (!this.isPlaying || !this.isMuted) return;
        this.masterGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 2.0);
        this.isMuted = false;
    }

    /* Generative modulation */
    startGenerativeModulation() {
        const intervalTime = 3.5 // seconds
        this.generativeInterval = setInterval(() => {
            const time = this.ctx.currentTime;
            
            // Filter cutoff modulation
            const nextFilterFreq = 150 + (Math.random() * 300);
            this.filter.frequency.setTargetAtTime(nextFilterFreq, time, intervalTime);
    
            // Osc detuning
            const detune = 0.005 + (Math.random() * 0.01);
            this.osc2.frequency.setTargetAtTime(this.baseFrequency + detune, time, intervalTime);
    
            // Noise gain modulation
            const nextNoiseVol = 0.15 + (Math.random() * 0.05);
            this.noiseGain.gain.setTargetAtTime(nextNoiseVol, time, intervalTime);
        }, 4000);
    }
}
