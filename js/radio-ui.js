/* Imports */
import { RadioAudio } from './radio-audio.js';
import { bringToFront } from './windows.js';
import { playSound } from './audio-samples.js';

export function initRadio() {
    const radioIcon = document.getElementById('radio-icon');
    const radioWidget = document.getElementById('radio-widget');
    const radioTop = radioWidget.querySelector('.radio-top-section');

    const bandSwitch = radioWidget.querySelector('#band-switch');
    const fmLabel = radioWidget.querySelector('.band-label:nth-child(1)');
    const amLabel = radioWidget.querySelector('.band-label:nth-child(2)');

    const volInput = radioWidget.querySelector('.radio-volume-input');

    if (!radioIcon || !radioWidget) return;

    /* Z-Index */
    radioWidget.addEventListener('mousedown', () => bringToFront(radioWidget));


    /* Open widget */
    radioIcon.addEventListener('click', () => {
        radioWidget.style.display = 'flex';
        radioWidget.classList.remove('radio-minimized');
        bringToFront(radioWidget);
    });


    /* Close vs minimize */
    radioTop.addEventListener('click', () => {
        const isPoweredOn = radioWidget.classList.contains('is-powered-on');

        if (isPoweredOn) {
            radioWidget.classList.toggle('radio-minimized');
        } else {
            radioWidget.style.display = 'none';
            radioWidget.classList.remove('radio-minimized');
        }
    });


    /* Volume + Power */
    if (volInput) {
        volInput.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);

            if (volume > 0.05) {
                RadioAudio.setVolume(volume);

                if (!radioWidget.classList.contains('is-powered-on')) {
                    // Play sounds
                    playSound('radio-switch', {volume: 0.9, pitchVar: 25});
                    playSound('radio-startup', {volume: 0.75, pitchVar: 500});

                    radioWidget.classList.add('is-powered-on');
                    RadioAudio.play();

                    // Start magic-eye warmup
                    warmupStartTime = Date.now();
                    isWarmingUp = true;

                    currentGap = 300;
                    currentGlow = 4;
                    currentIntensity = 0;

                    if (!isEyeActive) {
                        isEyeActive = true;
                        requestAnimationFrame(animateEye);
                    }
                }
            } else {
                if (radioWidget.classList.contains('is-powered-on')) {
                    // Play power switch sound
                    playSound('radio-switch', {volume: 0.8, pitchVar: 25});

                    radioWidget.classList.remove('is-powered-on');
                    RadioAudio.setVolume(0);
                    RadioAudio.pause();
                    
                    isWarmingUp = false;
                    isEyeActive = false;
                    if (magicEye) magicEye.style.setProperty('--eye-intensity', '0');
                }
            }
        });
    }


    /* Info button */
    const infoBtn = radioWidget.querySelector('.radio-info-btn');

    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            if (!radioWidget.classList.contains('is-powered-on')) return;

            const guideWindow = document.getElementById('user-guide-window');
            if (!guideWindow) return;

            // Open User Guide and Bring to Front
            guideWindow.style.display = 'flex';
            bringToFront(guideWindow);

            // Get the target guide page via info button 'data-target' attribute or appName as a fallback
            const targetId = infoBtn.getAttribute('data-target') || `guide-${appName}`;

            // Selects the corresponding User Guide entry
            const tocItem = document.querySelector(`.toc-item[data-target="${targetId}"]`);
            if (tocItem) {
                tocItem.click();
            } else {
                console.warn(`Guide page not found for target ID "${targetId}"`);
            }
        });
    }


    /* Source button */
    const srcBtn = radioWidget.querySelector('.src-btn');

    if (srcBtn) {
        // Light up if source link exists
        document.addEventListener('radio-link-update', (e) => {
            const hasLink = e.detail;
            
            if (hasLink && radioWidget.classList.contains('is-powered-on')) {
                srcBtn.classList.add('has-source');
            } else {
                srcBtn.classList.remove('has-source');
            }
        });

        // Click event listener
        srcBtn.addEventListener('click', () => {
            if (!radioWidget.classList.contains('is-powered-on')) return;

            const link = RadioAudio.getTunedTrackLink();

            if (link) {
                window.open(link, '_blank');
            } else {
                console.log('No associated link or station out of tune');
            }
        });
    }


    /* AM/FM Selector */
    if (bandSwitch && fmLabel && amLabel) {
        bandSwitch.addEventListener('click', () => {
            const isAM = bandSwitch.classList.toggle('is-am');
            const newBand = isAM ? 'am' : 'fm';

            if (isAM) {
                fmLabel.classList.remove('active');
                amLabel.classList.add('active');
            } else {
                amLabel.classList.remove('active');
                fmLabel.classList.add('active');
            }

            RadioAudio.setBand(newBand);

            /* Adjust needle position to stay the same when switching bands */
            if (tuneInput) {
                const oldMin = parseFloat(tuneInput.min);
                const oldMax = parseFloat(tuneInput.max);
                const currentProgress = (parseFloat(tuneInput.value) - oldMin) / (oldMax - oldMin);

                const newMin = isAM ? 52 : 86;
                const newMax = isAM ? 162 : 110;
                tuneInput.min = newMin;
                tuneInput.max = newMax;
                tuneInput.value = (currentProgress * (newMax - newMin)) + newMin;

                tuneInput.dispatchEvent(new Event('input'));
            }
        });
    }


    /* Needle position */
    const tuneInput = radioWidget.querySelector('.radio-freq-input');
    const needle = radioWidget.querySelector('.dial-needle');

    if (tuneInput && needle) {
        tuneInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const min = parseFloat(e.target.min);
            const max = parseFloat(e.target.max);

            const progress = (val - min) / (max - min);
            let percent = progress * 100;
            // Clamp to fit glass
            percent = Math.max(2, Math.min(98, percent));

            needle.style.left = `${percent}%`;

            // Send freq value to radio-audio
            RadioAudio.setFrequency(val);
        });
    }
    
    // Initialize needle position
    if (tuneInput) {
        tuneInput.dispatchEvent(new Event('input'));
    }

    /* -- Magic Eye Logic -- */
    const magicEye = radioWidget.querySelector('.magic-eye-tube');

    /* Warmup Logic */
    let warmupStartTime = 0;
    const WARMUP_DURATION = 20000;
    let isWarmingUp = false;
    let isEyeActive = false;

    let targetGap = 300;
    let targetGlow = 4;
    let targetIntensity = 1.0;

    let currentGap = 300;
    let currentGlow = 4;
    let currentIntensity = 0;

    // Animation loop
    function animateEye() {
        if (!isEyeActive) return;

        // Warmup curve
        let thermalCurve = 1.0;
        if (isWarmingUp) {
            const elapsed = Date.now() - warmupStartTime;
            let progress = Math.min(1.0, elapsed / WARMUP_DURATION);
            thermalCurve = Math.pow(progress, 3);
            if (progress >= 1.0) isWarmingUp = false;
        }

        // Current state calculation
        const frameTargetGap = 300 - ((300 - targetGap) * thermalCurve);
        const frameTargetGlow = 4 + ((targetGlow - 4) * thermalCurve);
        const frameTargetIntensity = targetIntensity * thermalCurve;

        // Analog inertia
        let inertiaScale = 0.05
        currentGap += (frameTargetGap - currentGap) * inertiaScale;
        currentGlow += (frameTargetGlow - currentGlow) * inertiaScale;
        currentIntensity += (frameTargetIntensity - currentIntensity) * inertiaScale;

        // Apply to CSS
        if (magicEye) {
            magicEye.style.setProperty('--eye-gap', `${currentGap}deg`);
            magicEye.style.setProperty('--eye-glow', `${currentGlow}px`);
            magicEye.style.setProperty('--eye-intensity', currentIntensity.toString());
        }

        requestAnimationFrame(animateEye);
    }

    document.addEventListener('radio-tuning', (e) => {
        const tuneFactor = e.detail; 
        
        // Target values
        targetGap = 300 - (tuneFactor * 305);
        targetGlow = 4 + (tuneFactor * 50);
    });


    /* Bank/AFC seek logic */
    const bankBtns = radioWidget.querySelectorAll('.bank-btn');
    let seekAnimationId = null;

    if (bankBtns.length >= 2 && tuneInput) {
        const btnDown = bankBtns[0]; // <
        const btnUp = bankBtns[1];   // >

        const visualKnob = radioWidget.querySelector('.tune-knob');
        
        const startSeek = (direction) => {
            if (!radioWidget.classList.contains('is-powered-on')) return;
            
            const targetFreq = RadioAudio.getNextBankedFrequency(direction);
            if (!targetFreq) return;

            // Cancel with double-click
            if (seekAnimationId) cancelAnimationFrame(seekAnimationId);

            const startFreq = parseFloat(tuneInput.value);
            const distance = targetFreq - startFreq;
            
            // Duration based on distance
            const duration = Math.max(1500, Math.abs(distance) * 200);

            const startTime = performance.now();
            const animateSeek = (currentTime) => {
                const elapsed = currentTime - startTime;
                let progress = Math.min(elapsed / duration, 1.0);
                
                // Easing in-out
                const ease = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                const currentVal = startFreq + (distance * ease);

                // Update input value
                tuneInput.value = currentVal;
                tuneInput.dispatchEvent(new Event('input'));

                // Turning the knob
                if (visualKnob) {
                    const min = parseFloat(tuneInput.min);
                    const max = parseFloat(tuneInput.max);
                    const percent = (currentVal - min) / (max - min);

                    const degrees = percent * 1800;
                    visualKnob.style.transform = `rotate(${degrees}deg)`;
                }

                if (progress < 1.0) {
                    seekAnimationId = requestAnimationFrame(animateSeek);
                } else {
                    seekAnimationId = null;
                }
            };
            
            seekAnimationId = requestAnimationFrame(animateSeek);
        };

        btnDown.addEventListener('click', () => startSeek(-1));
        btnUp.addEventListener('click', () => startSeek(1));
    }
}