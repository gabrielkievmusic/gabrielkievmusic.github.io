import { updateSystemScale } from '../sound/ui-sounds.js';
import { getAudioContext, getMasterBus, getDroneBus, getUIBus } from '../sound/audio.js';

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
let currentRootIndex = 0;

function midiToHz(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}

export function initSettingsMenu() {

    /* Mixer */
    const volMaster = document.getElementById('settings-mixer-master');
    volMaster.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        getMasterBus().gain.setTargetAtTime(val * val, getAudioContext().currentTime, 0.05);
    });

    const volDrone = document.getElementById('settings-mixer-drone');
    volDrone.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        getDroneBus().gain.setTargetAtTime(val * val, getAudioContext().currentTime, 0.05);
    });

    const volUI = document.getElementById('settings-mixer-ui');
    volUI.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        getUIBus().gain.setTargetAtTime(val * val, getAudioContext().currentTime, 0.05);
    });

    volMaster.dispatchEvent(new Event('input'));
    volDrone.dispatchEvent(new Event('input'));
    volUI.dispatchEvent(new Event('input'));    


    /* Root note selector */
    const rootDisplay = document.getElementById('root-display');
    const btnPrev = document.getElementById('root-prev');
    const btnNext = document.getElementById('root-next');
    
    const updateRootUI = () => {
        // Update root note display
        rootDisplay.textContent = noteNames[currentRootIndex];

        // Update root note in scale keyboard
        document.querySelectorAll('.scale-circle').forEach(circle => circle.classList.remove('is-root'));
        const newRootCircle = document.querySelector(`.scale-circle[data-note="${currentRootIndex}"]`);
        if (newRootCircle) newRootCircle.classList.add('is-root');

        compileAndSendScale();
    };

    // Previous btn
    btnPrev.addEventListener('click', () => {
        currentRootIndex = (currentRootIndex - 1 + 12) % 12;
        updateRootUI();
    });

    // Next btn
    btnNext.addEventListener('click', () => {
        currentRootIndex = (currentRootIndex + 1) % 12;
        updateRootUI();
    });


    /* Scale selector */
    const scaleCircles = document.querySelectorAll('.scale-circle');

    scaleCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            circle.classList.toggle('active');
            compileAndSendScale();
        });
    });

    /* Auxiliary function to update the scale and send to the synth */
    function compileAndSendScale() {
        const intervals = [];
    
        scaleCircles.forEach((circle, absoluteNoteIndex) => {
            if (circle.classList.contains('active')) {
                const relativeInterval = (absoluteNoteIndex - currentRootIndex + 12) % 12;
                intervals.push(relativeInterval);
            }
        });
    
        intervals.sort((a,b) => a-b);
    
        const midiRoot = 36 + currentRootIndex;
        
        updateSystemScale(midiRoot, intervals);

        document.dispatchEvent(new CustomEvent('system-root-changed', {
            detail: { frequency: midiToHz(midiRoot) }
        }));
    }

}