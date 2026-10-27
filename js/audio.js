let audioCtx = null;
let masterGain = null;
let limiter = null;

/* ----------------------------------------------------------
 * PRIVATE FUNCTIONS
 * ---------------------------------------------------------- */

/* Synthetic Impulse Response function for reverb */
function createReverbImpulse(context, duration=2.5, decay=3.0) {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;

    // Create empty buffer
    const impulse = context.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    // Fill buffer with synthesized reverb decay
    for (let i=0; i < length; i++) {
        const time = i / sampleRate;
        const envelope = Math.pow(1.0 - time / duration, decay);
        left[i] = (Math.random() * 2.0 - 1.0) * envelope;
        right[i] = (Math.random() * 2.0 - 1.0) * envelope;
    }
    return impulse;
}


/* ----------------------------------------------------------
 * MAIN MIXER
 * ---------------------------------------------------------- */
export function getAudioContext() {
    if (!audioCtx) {
        const audioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new audioContext();
        console.log('AudioContext created. Sample rate:', audioCtx.sampleRate);

        /* Create MIXER */
        /* Limiter */
        limiter = audioCtx.createDynamicsCompressor();
        limiter.threshold.value = -3.0; // threshold [dB]
        limiter.knee.value = 12;        // knee [dB]
        limiter.ratio.value = 20;       // ratio
        limiter.attack.value = 0.005;   // attack [seconds]
        limiter.release.value = 0.05;   // release [seconds]

        /* Master Gain */
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.4;  // Set initial value with headroom

        /* Connect nodes */
        /* Master -> Limiter -> Destination */
        masterGain.connect(limiter);
        limiter.connect(audioCtx.destination);

        console.log('Audio mixer created: Master Gain -> Limiter -> Destination');
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    return audioCtx;
}

export function getMasterBus() {
    return masterGain;
}


/* ----------------------------------------------------------
 * EFFECTS
 * ---------------------------------------------------------- */

/* Reverb */
export function createReverbEffect(context, duration=2.5, decay=3.0) {
    const input = context.createGain();
    const output = context.createGain();

    const convolver = context.createConvolver();
    convolver.buffer = createReverbImpulse(context, duration, decay);

    const dryGain = context.createGain();
    const wetGain = context.createGain();
    dryGain.gain.value = 0.7;
    wetGain.gain.value = 0.3;

    /* Internal connections */
    // Input -> dryGain 
    input.connect(dryGain);

    // Input -> Convolver -> wetGain
    input.connect(convolver);
    convolver.connect(wetGain);

    // dryGain -> Output
    // wetGain -> Output
    dryGain.connect(output);
    wetGain.connect(output);

    return {
        input: input,
        output: output,
        setMix: (wetPercentage) => {
            const wet = Math.max(0, Math.min(1, wetPercentage));
            const dry = 1.0 - wet;
            dryGain.gain.setTargetAtTime(dry, context.currentTime, 0.02);
            wetGain.gain.setTargetAtTime(wet, context.currentTime, 0.02);
        }
    }
}