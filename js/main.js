import { initBoot } from "./boot.js";
import { initWindows } from "./windows.js";
import { initCRT } from "./crt.js";
import { initUIComponents } from "./ui-components.js"
import { initRadio } from "./radio-ui.js";
import { initEasel } from "./easel.js";
import { initCymaticCanvas } from "./shaders/cymatic-easel.js";
import { initUserGuide } from "./user-guide.js";

initBoot();
initCRT();
initWindows();

initRadio();
initEasel();
initCymaticCanvas();
initUserGuide();

initUIComponents();
