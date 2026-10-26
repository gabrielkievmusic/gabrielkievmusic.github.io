/* Function to convert osc freq to HSL color and then to RGB */
function getFreqColor(freq) {
    /* Define freq scale */
    const minFreq = 20;
    const maxFreq = 10000;
    const clampedFreq = Math.max(minFreq, Math.min(freq, maxFreq));

    /* Get normalized position in scale */
    let norm = (clampedFreq - minFreq) / (maxFreq - minFreq);

    /* Use exponential curve to map colors */
    let t = Math.pow(norm, 0.9);


    /* Map to HSL */
    let h = t * 0.85;  // stop it on magenta before turning red
    let s = 1.0;  // max saturation
    let l = 0.5;  // mid lightness

    /* Standard algorithm to convert HSL to RGB */
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    return [hue2rgb(p, q, h + 1/3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1/3)];
}

/* VERTEX SHADER */
const vertexShaderSource =/* glsl */ `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

/* FRAGMENT SHADER */
const fragmentShaderSource = /* glsl */ `
    precision mediump float;

    #define PI 3.14159265359

    /* Get uniforms */
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec4 u_oscillators[5];  // (n, m, gain, sign(+/-))
    uniform vec3 u_colors[5];

    float chladni(vec2 uv, float n, float m, float pm) {
        float term1 = sin(n*PI*uv.x) * sin(m*PI*uv.y);
        float term2 = sin(m*PI*uv.x) * sin(n*PI*uv.y);
        return (term1 + pm*term2);
    }
    
    void main() {
        /* Normalize coordinates */
        //vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.xy;

        /* Black background */
        vec3 col = vec3(0.0);

        /* Loop through the oscillators */
        for(int i=0; i<5; i++) {
            // Get variables
            float n = u_oscillators[i].x;
            float m = u_oscillators[i].y;
            float gain = u_oscillators[i].z;
            float pm = u_oscillators[i].w;
            
            if (gain <= 0.0) continue;
            
            /* Calculate Chladni pattern */
            // Find nearest integer modes
            float nf = floor(n); float nc = ceil(n);
            float mf = floor(m); float mc = ceil(m);

            // Calculate the four "neighboring" patterns
            float wff = chladni(uv, nf, mf, pm);
            float wcf = chladni(uv, nc, mf, pm);
            float wfc = chladni(uv, nf, mc, pm);
            float wcc = chladni(uv, nc, mc, pm);

            // Interpolate between them to get the fake intermediary modes
            float tn = fract(n); float tm = fract(m);
            float w_ff_cf = mix(wff, wcf, tn);
            float w_fc_cc = mix(wfc, wcc, tn);
            float w = mix(w_ff_cf, w_fc_cc, tm);
            
            // Calculate a multiplier for the 'thickness' based on the oscillator number
            // TODO: change so it is based solely on the frequency of the oscillator
            float x = float(i);
            float freqMult = 0.0357143*x*x + 0.485714*x - 0.3;
            
            // Draw nodal lines with varying thickness
            float thickness = 0.2 + 0.1*((cos(freqMult*u_time)+1.)/2.) + 0.1*(abs(uv.x-0.5)) + 0.1*(abs(uv.y-0.5));
            float nodeLine = clamp(thickness/abs(w), 0.0, 1.5);
            
            // Apply color with gain
            col += nodeLine * 0.5*gain * u_colors[i];
        }
        
        // Output to screen
        gl_FragColor = vec4(col,1.0);
   }
`;

/* Shader compilation */
export function initCymaticCanvas() {
    const canvas = document.getElementById('cymatic-canvas');
    canvas.width = 512;
    canvas.height = 512;

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    /* Compile shaders auxiliary function */
    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }


    /* Compile shaders */
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    /* Connect shaders to program */
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    /* Define geometry (square covering screen [-1, 1]) */
    const positions = new Float32Array([
        -1.0, -1.0,   1.0, -1.0,   -1.0, 1.0,
        -1.0, 1.0,    1.0, -1.0,    1.0, 1.0,
    ]);

    /* Send geometry to GPU */
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    /* Send resolution to GPU */
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    /* Render */
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);


    /* "Portal" canvas up through the layers -------------------*/
    const placeholder = document.getElementById('canvas-placeholder');


    /* Memory allocation for uniforms */
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const oscLocation = gl.getUniformLocation(program, "u_oscillators");
    const colorsLocation = gl.getUniformLocation(program, "u_colors");

    /* TEMP - color palette */
    const colorsData = new Float32Array([
        1.0, 0.2, 0.2,  
        1.0, 0.8, 0.2,  
        0.2, 1.0, 0.2,  
        0.2, 0.8, 1.0,  
        1.0, 0.2, 1.0   
    ]);
    gl.uniform3fv(colorsLocation, colorsData);

    /* Start time */
    let startTime = performance.now();

    /* --- LOOP --- */
    function syncCanvasPortal() {
        /* Make it follow the window */
        if (placeholder && canvas) {
            /* Get position */
            const rect = placeholder.getBoundingClientRect();

            /* Hide if window closed */
            if (rect.width > 0) {
                canvas.style.display = 'block';
                canvas.style.left = `${rect.left}px`;
                canvas.style.top = `${rect.top}px`;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;
            } else {
                canvas.style.display = 'none';
            }
        }


        /* Update uniform values */
        /* Time */
        const currentTime = (performance.now() - startTime) / 1000.0;  // in seconds
        gl.uniform1f(timeLocation, currentTime);

        /* Get data from the oscillators */
        const oscData = new Float32Array(5 * 4);  // 5 osc, 4 properties (n, m, gain, sign)
        const colorsData = new Float32Array(5 * 3);  // 5 osc, 3 channels (RGB)

        /* Get fundamental frequency */
        const fundamentalInput = document.getElementById('osc1-freq');
        const fundamentalFreq = fundamentalInput ? parseFloat(fundamentalInput.value) : 440;

        /* Variables for ambient light around canvas */
        let ambientR = 0, ambientG = 0, ambientB = 0;
        let totalGain = 0;

        /* iterate through all oscillators */
        for (let i = 0; i < 5; i++) {
            const id = `osc${i + 1}`;
            const freqInput = document.getElementById(`${id}-freq`);
            const gainInput = document.getElementById(`${id}-gain`);

            if (!freqInput || !gainInput) continue;

            let sliderValue = parseFloat(freqInput.value);
            let gain = parseFloat(gainInput.value);

            /* Frequency logic */
            /* if Osc1, sliderValue is the frequency; else, sliderValue is multiplier of Osc1 freq */
            let trueFreq = (i === 0) ? sliderValue : (fundamentalFreq * sliderValue);

            /* Logic to fake oscillation modes as continuous values */
            /* Get square root dependency (f = C(n^2 + m^2))  =>  C=10, n=m=1 <=> f=20Hz */
            let R = Math.sqrt(trueFreq / 10.0);  // circle of radius R in the modal plane

            /* Get n and m by going around the circle in the modal plane */
            let angle = Math.PI / 4.0 + 0.4 * Math.sin(R - Math.SQRT2);
            let n = R * Math.cos(angle);
            let m = R * Math.sin(angle);

            /* TEMP: alternate sign for each osc */
            /* TODO: add toggle to oscillator to choose sign */
            let pm = (i % 2 === 0) ? 1.0 : -1.0;

            /* Fill arrays */
            oscData[i * 4 + 0] = n;
            oscData[i * 4 + 1] = m;
            oscData[i * 4 + 2] = gain;
            oscData[i * 4 + 3] = pm;

            /* Apply color */
            const rgb = getFreqColor(trueFreq);
            colorsData[i * 3 + 0] = rgb[0];
            colorsData[i * 3 + 1] = rgb[1];
            colorsData[i * 3 + 2] = rgb[2];

            // Apply color to ambient lighting variables
            if (gain > 0) {
                ambientR += rgb[0] * gain;
                ambientG += rgb[1] * gain;
                ambientB += rgb[2] * gain;
                totalGain += gain;
            }

        }

        /* Send ambient light to CSS box-shadow */
        if (totalGain > 0) {
            // adjust range
            let r = Math.min(255, Math.round(ambientR * 255));
            let g = Math.min(255, Math.round(ambientG * 255));
            let b = Math.min(255, Math.round(ambientB * 255));

            // Pulsing effect
            let pulse = 0.6 + 0.05 * Math.sin(currentTime);
            
            // Ajust opacity and length based on total gain
            let shadowAlpha = Math.min(1.0, totalGain * pulse);
            let shadowLength = Math.max(40, Math.min(totalGain*pulse*150, 250));

            // Update CSS shadow
            canvas.style.boxShadow = `0 0 ${shadowLength}px rgba(${r}, ${g}, ${b}, ${shadowAlpha})`;
        } else {
            // No light if gain is 0
            canvas.style.boxShadow = "none";
        }

        /* Send data to GPU */
        gl.uniform4fv(oscLocation, oscData);
        gl.uniform3fv(colorsLocation, colorsData);

        /* Redraw */
        gl.drawArrays(gl.TRIANGLES, 0, 6);


        /* Update every frame */
        requestAnimationFrame(syncCanvasPortal);
    }
    syncCanvasPortal();
}