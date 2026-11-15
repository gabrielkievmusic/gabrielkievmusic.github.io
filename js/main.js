import { initBoot } from "./boot.js";
import { initWindows } from "./windows.js";
import { initCRT } from "./crt.js";
import { initUIComponents } from "./ui-components.js"
import { initRadio } from "./radio-ui.js";
import { initEasel } from "./easel.js";
import { initCymaticCanvas } from "./shaders/cymatic-easel.js";
import { initUserGuide } from "./user-guide.js";
import { initUISounds } from "./ui-sounds.js";
import { DesktopDrone } from "./sound/desktop-drone.js";


initBoot();
initCRT();
initWindows();

initRadio();
initEasel();
initCymaticCanvas();
initUserGuide();

initUIComponents();
initUISounds();


const systemDrone = new DesktopDrone(65.41);
let isDroneStarted = false;
document.addEventListener('mousedown', () => {
    if (!isDroneStarted) {
        systemDrone.start();
        isDroneStarted = true;
    }
}, { once: true });

/* Audio focus manager */
let activeAudioPrograms = 0; // Amount of apps playing audio

document.addEventListener('audio-focus-change', (e) => {
    if (e.detail.isPlaying) {
        activeAudioPrograms++;
        systemDrone.mute(); 
    } else {
        activeAudioPrograms = Math.max(0, activeAudioPrograms - 1); // Evita números negativos
        
        // If no apps playing sound, play drone
        if (activeAudioPrograms === 0) {
            systemDrone.unmute();
        }
    }
});
