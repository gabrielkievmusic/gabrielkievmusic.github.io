import { initBoot } from "./boot.js";
import { initWindows } from "./windows.js";
import { initCRT } from "./crt.js";
import { initUIComponents } from "./ui-components.js"
import { initRadio } from "./apps/radio-ui.js";
import { initEasel } from "./apps/easel.js";
import { initCymaticCanvas } from "./shaders/cymatic-easel.js";
import { initUserGuide } from "./apps/user-guide.js";
import { initUISounds } from "./sound/ui-sounds.js";
import { DesktopDrone } from "./sound/desktop-drone.js";
import { initSettingsMenu } from "./apps/system-settings.js";


initBoot();
initCRT();
initWindows();

initRadio();
initEasel();
initCymaticCanvas();
initUserGuide();
initSettingsMenu();

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
document.addEventListener('system-root-changed', (e) => {
    if (systemDrone) {
        systemDrone.updateBaseNote(e.detail.frequency);
    }
});

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
