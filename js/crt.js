import { PinkNoise } from "./random.js";

export function initCRT() {
    const overlay = document.getElementById("crt-overlay");
    if (!overlay) return;

    const pinkNoise = new PinkNoise();  // [0, 1] range

    function applyFlicker() {
        const normalizedNoise = (pinkNoise.next() + 1)/2;
        const brightness = 0.75 + (normalizedNoise * 0.3);

        document.documentElement.style.setProperty('--flicker-brightness', brightness);
        
        requestAnimationFrame(applyFlicker);
    }
    applyFlicker();
}