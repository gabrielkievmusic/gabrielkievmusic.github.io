let audioCtx = null;
let masterGain = null;
let limiter = null;

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