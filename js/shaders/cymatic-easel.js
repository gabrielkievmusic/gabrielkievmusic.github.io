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

    uniform vec2 u_resolution;
    
    void main() {
        /* Normalize coordinates */
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;

        /* Centralize coords */
        vec2 centered_uv = uv * 2.0 - 1.0;

        /* Map to color */
        gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
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

    /* Make it follow the window */
    function syncCanvasPortal() {
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
        /* Update every frame */
        requestAnimationFrame(syncCanvasPortal);
    }
    syncCanvasPortal();
}