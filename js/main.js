import { initBoot } from "./boot.js";
import { initWindows } from "./windows.js";
import { initCRT } from "./crt.js";
import { initSliders } from "./sliders.js";
import { initEasel } from "./easel.js";
import { initCymaticCanvas } from "./shaders/cymatic-easel.js";

initBoot();
initWindows();
initCRT();
initSliders();
initEasel();
initCymaticCanvas();
