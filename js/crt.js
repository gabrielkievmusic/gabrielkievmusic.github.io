import { PinkNoise } from "./random.js";

export function initCRT() {
    const overlay = document.getElementById("crt-overlay");
    if (!overlay) return;

    const pinkNoise = new PinkNoise();

    function applyFlicker() {
        const normalizedNoise = (pinkNoise.next() + 1)/2;
        const brightness = 0.85 + (normalizedNoise * 0.15);

        document.documentElement.style.setProperty('--flicker-brightness', brightness);
        
        requestAnimationFrame(applyFlicker);
    }
    applyFlicker();
}