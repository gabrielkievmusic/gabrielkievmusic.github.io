export function initUIComponents() {
    /* --- Check for clicks --- */
    document.addEventListener('click', (e) => {
        /* Square-toggle buttons */
        if (e.target.matches('.square-toggle')) {
            // Toggle state
            const isCurrentlyActive = e.target.getAttribute('data-active') === 'true';
            const newState = !isCurrentlyActive;
            
            // Visual feedback
            e.target.setAttribute('data-active', newState.toString());
    
            // Custom event "toggleChange"
            const toggleEvent = new CustomEvent('toggleChange', { 
                detail: { isActive: newState } 
            });
            e.target.dispatchEvent(toggleEvent);
        }
    });

    /* --- Initialize sliders --- */
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

    /* --- Initialize knobs --- */
    let activeKnob = null;
    let startY = 0;
    let startValue = 0;
    let linkedInput = null;

    // On mousedown
    // Get the knob element, link to the corresponding hidden range input, store its initial position and value, and lock the cursor icon
    document.addEventListener('mousedown', (e) => {
        const knob = e.target.closest('.ui-knob, .ui-knob-small');
        if (knob) {
            activeKnob = knob;
            startY = e.clientY;  // Store initial Y position

            // Link range input to knob
            linkedInput = knob.parentElement.querySelector('input[type="range"]');
            startValue = parseFloat(linkedInput.value);  // Store initial value

            // Lock cursor icon
            document.body.style.cursor = 'ns-resize';

            // Prevent text selection while dragging
            e.preventDefault();
        }   
    });

    // On mousemove
    document.addEventListener('mousemove', (e) => {
        if (!activeKnob || !linkedInput) return;  // Exit if no active knob

        const deltaY = startY - e.clientY;  // Calculate vertical movement
        
        const customSens = activeKnob.getAttribute('knob-sensitivity');
        const sensitivity = customSens ? parseFloat(customSens) : 0.005;

        const min = parseFloat(linkedInput.min);
        const max = parseFloat(linkedInput.max);

        const isLog = linkedInput.getAttribute('data-scale') === 'log';
        let norm = 0;

        if (isLog) {
            norm = Math.log(startValue / min) / Math.log(max / min);
        } else {
            norm = (startValue - min) / (max - min);
        }

        // Calculate new value
        norm += deltaY * sensitivity;
        norm = Math.max(0, Math.min(1, norm));  // Clamp value within range

        /* Snap effect */
        const snapThreshold = activeKnob.getAttribute('data-snap');
        if (snapThreshold) {
            if (norm < parseFloat(snapThreshold)) norm = 0;
        }

        let newValue;
        if (isLog) {
            newValue = min * Math.pow(max / min, norm);
        } else {
            newValue = min + norm * (max - min);
        }
        
        if (linkedInput.value !== newValue.toString()) {
            linkedInput.value = newValue;  // Update the hidden input

            // Rotate the knob pointer
            updateKnobPointer(activeKnob, newValue, min, max, linkedInput);
            
            // Trigger input event
            linkedInput.dispatchEvent(new Event('input', { bubbles: true }));           
        }
    });

    // On mouseup
    document.addEventListener('mouseup', () => {
        if (activeKnob) {
            activeKnob = null;
            linkedInput = null;
            document.body.style.cursor = 'default';  // Reset cursor
        }
    });

    // Function to map input value [0, 1] to rotation angle [-135, +135]
    function updateKnobPointer(knob, value, min, max, inputElement) {
        const isLog = inputElement ? inputElement.getAttribute('data-scale') === 'log' : false;
        
        const isInfinite = knob.hasAttribute('data-infinite');
        
        let norm;

        if (isLog) {
            if (min <= 0) {
                console.warn('Zero or negative value detected in log scale');
            } else {
                norm = Math.log(value / min) / Math.log(max / min);
            }
        } else {
            norm = (value - min) / (max - min);
        }

        let angle;
        if (isInfinite) {
            angle = norm * 1800;
        } else {
            angle = -135 + (norm * 270);
        }
        
        const dial = knob.querySelector('.knob-dial');
        if (dial) dial.style.transform = `rotate(${angle}deg)`;

        // Udpate the output value
        if (inputElement) {
            // Get the corresponding knob
            const group = knob.closest('.ui-knob-group');
            const output = group.querySelector('.knob-value');
            
            if (output) {
                // Get number of decimal digits
                const step = inputElement.getAttribute('step') || '1';
                const decimalPlaces = step.includes('.') ? step.split('.')[1].length : 0;
                
                // Formats number and appends unit
                output.textContent = value.toFixed(decimalPlaces);
            }
        }
    }

    const allKnobs = document.querySelectorAll('.ui-knob, .ui-knob-small');
    
    // Initialize all knob pointers based on initial values of their linked inputs
    allKnobs.forEach(knob => {
        // Identify knob and linked input
        const group = knob.closest('.ui-knob-group');
        const linkedInput = group.querySelector('.hidden-input');
        
        if (linkedInput) {
            const val = parseFloat(linkedInput.value);
            const min = parseFloat(linkedInput.min);
            const max = parseFloat(linkedInput.max);
            
            updateKnobPointer(knob, val, min, max, linkedInput);
        }
    });
}