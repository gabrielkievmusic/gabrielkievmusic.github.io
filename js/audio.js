let audioCtx = null;

export function getAudioContext() {
    if (!audioCtx) {
        const audioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new audioContext();
        console.log('AudioContext created. Sample rate:', audioCtx.sampleRate);
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    return audioCtx;
}