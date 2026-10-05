export function initSliders() {
    const sliders = document.querySelectorAll('.hslider');

    sliders.forEach(slider => {
        const output = slider.parentElement.querySelector('.slider-value');

        slider.addEventListener('input', (e) => {
            const currentValue = e.target.value;

            if (output) {
                output.textContent = currentValue;
            }
        });
    });
}