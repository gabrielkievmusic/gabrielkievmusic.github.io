import { initBoot } from "./boot.js";
import { initWindows } from "./windows.js";
import { initCRT } from "./crt.js";
import { initUIComponents } from "./ui-components.js"
import { initEasel } from "./easel.js";
import { initCymaticCanvas } from "./shaders/cymatic-easel.js";

initBoot();
initCRT();
initWindows();

initEasel();
initCymaticCanvas();

initUIComponents();