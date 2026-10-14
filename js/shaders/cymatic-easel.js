/* VERTEX SHADER */
const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

/* FRAGMENT SHADER */
const fragmentShaderSource = `
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
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;

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
            
            // Calculate Chladni pattern
            float w = chladni(uv, n, m, pm);
            
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

    /* Loop */
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

        /* TEMP - Mockup for oscillator data */
        const oscData = new Float32Array([
            4.0, 2.0, 1.0, 1.0,
            0.0, 0.0, 0.0, 0.0,
            7.0, 4.0, 0.8, -1.0,
            0.0, 0.0, 0.0, 0.0,
            11.0, 6.0, 0.6, -1.0
        ]);
        gl.uniform4fv(oscLocation, oscData);

        /* Redraw */
        gl.drawArrays(gl.TRIANGLES, 0, 6);


        /* Update every frame */
        requestAnimationFrame(syncCanvasPortal);
    }
    syncCanvasPortal();
}