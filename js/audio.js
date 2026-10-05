export function initAudio() {
    const powerBtn = document.querySelectorAll('.osc-toggle');

    powerBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const oscId = e.target.id;
            console.log(`Oscillator ${oscId} toggled`);
        });
    });
}

export function initEasel() {
    /* Get oscillator freqs */
    const oscFreqSliders = document.querySelectorAll('.osc-freq');

    oscFreqSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const currentValue = e.target.value;
            const oscId = e.target.id;

            console.log(`Oscillator ${oscId} frequency changed to: ${currentValue}`);
        });
    });

    /* Get oscillator gains */
    const oscGainSliders = document.querySelectorAll('.osc-gain');

    oscGainSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const currentValue = e.target.value;
            const oscId = e.target.id;

            console.log(`Oscillator ${oscId} gain changed to: ${currentValue}`);
        });
    });
}