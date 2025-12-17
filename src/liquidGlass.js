/**
 * Liquid Glass WebGL Effect
 * Full-screen flowing liquid glass with turbulent displacement
 * Inspired by soft pink/purple/blue gradient liquid aesthetics
 */

// Vertex shader - simple passthrough
const vertexShader = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shader - OPTIMIZED flowing liquid glass
const fragmentShader = `
  precision mediump float;

  varying vec2 v_texCoord;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_mouseInfluence;

  #define PI 3.14159265359

  // Fast hash function
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Simple value noise - much cheaper than simplex
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // Smoothstep

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // 2 octave fbm - minimal for performance
  float fbm2(vec2 p) {
    return noise(p) * 0.6 + noise(p * 2.0) * 0.4;
  }

  void main() {
    vec2 uv = v_texCoord;
    float t = u_time * 0.06;

    // Mouse influence
    vec2 mouseOffset = (u_mouse - 0.5) * u_mouseInfluence * 0.08;
    vec2 p = uv + mouseOffset;

    // === LARGE SMOOTH WAVES - using simple sine waves ===
    // Primary wave
    float wave1 = sin(p.x * 2.0 + p.y * 1.5 + t) * 0.5 + 0.5;
    // Secondary wave
    float wave2 = sin(p.x * 1.2 - p.y * 2.0 + t * 0.8) * 0.5 + 0.5;
    // Tertiary diagonal wave
    float wave3 = sin((p.x + p.y) * 1.8 + t * 0.6) * 0.5 + 0.5;

    // Add subtle noise for organic feel (single sample)
    float n = fbm2(p * 1.5 + t * 0.3);

    // Combine waves
    float flow = wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.2 + n * 0.1;

    // === BRAND COLORS ===
    vec3 olbraBlue = vec3(0.302, 0.576, 1.0);       // #4d93ff
    vec3 olbraPurple = vec3(0.545, 0.361, 0.965);   // #8b5cf6
    vec3 lightBg = vec3(0.96, 0.97, 0.99);          // Light background
    vec3 paleBlueBg = vec3(0.85, 0.92, 1.0);        // More visible pale blue
    vec3 palePurpleBg = vec3(0.90, 0.85, 1.0);      // More visible pale purple

    // Build color from waves - more visible transitions
    vec3 color = lightBg;
    color = mix(color, paleBlueBg, smoothstep(0.25, 0.5, flow));
    color = mix(color, palePurpleBg, smoothstep(0.45, 0.7, flow + uv.y * 0.2));

    // More visible brand color tints
    color = mix(color, mix(lightBg, olbraBlue, 0.25), smoothstep(0.55, 0.8, flow));
    color = mix(color, mix(lightBg, olbraPurple, 0.20), smoothstep(0.65, 0.9, flow + uv.x * 0.15));

    // === SIMPLE NORMAL FROM WAVES ===
    // Analytical derivatives - no extra texture lookups!
    float dx = cos(p.x * 2.0 + p.y * 1.5 + t) * 2.0 * 0.4
             + cos(p.x * 1.2 - p.y * 2.0 + t * 0.8) * 1.2 * 0.3
             + cos((p.x + p.y) * 1.8 + t * 0.6) * 1.8 * 0.2;

    float dy = cos(p.x * 2.0 + p.y * 1.5 + t) * 1.5 * 0.4
             - cos(p.x * 1.2 - p.y * 2.0 + t * 0.8) * 2.0 * 0.3
             + cos((p.x + p.y) * 1.8 + t * 0.6) * 1.8 * 0.2;

    vec3 normal = normalize(vec3(-dx * 0.15, -dy * 0.15, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    // === SPECULAR HIGHLIGHTS ===
    // Main light
    vec3 lightDir1 = normalize(vec3(-0.4, -0.5, 1.0));
    float spec1 = pow(max(dot(normal, normalize(lightDir1 + viewDir)), 0.0), 20.0);

    // Secondary light
    vec3 lightDir2 = normalize(vec3(0.5, -0.3, 1.0));
    float spec2 = pow(max(dot(normal, normalize(lightDir2 + viewDir)), 0.0), 15.0);

    // Animated light
    float lightAnim = sin(t * 1.2) * 0.3;
    vec3 lightDir3 = normalize(vec3(lightAnim, -0.4, 1.0));
    float spec3 = pow(max(dot(normal, normalize(lightDir3 + viewDir)), 0.0), 25.0);

    float totalSpec = spec1 * 0.5 + spec2 * 0.3 + spec3 * 0.4;
    color += vec3(1.0) * totalSpec * 0.5;

    // === FRESNEL ===
    float fresnel = pow(1.0 - dot(normal, viewDir), 2.5);
    color += vec3(1.0) * fresnel * 0.1;

    // Subtle brand color at edges
    vec3 fresnelTint = mix(olbraBlue, olbraPurple, wave1);
    color = mix(color, color + fresnelTint * 0.08, fresnel * 0.3);

    gl_FragColor = vec4(color, 1.0);
  }
`;

class LiquidGlass {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.gl = null;
    this.program = null;
    this.animationId = null;
    this.startTime = Date.now();
    this.mouse = { x: 0.5, y: 0.5 };
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.mouseInfluence = 0;
    this.targetMouseInfluence = 0;
    this.isHovering = false;

    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    this.container.insertBefore(this.canvas, this.container.firstChild);

    // Get WebGL context
    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });

    if (!this.gl) {
      console.warn('WebGL not supported, falling back to CSS');
      this.canvas.remove();
      return;
    }

    this.setupShaders();
    this.setupGeometry();
    this.resize();
    this.setupEvents();
    this.animate();
  }

  setupShaders() {
    const gl = this.gl;

    // Compile vertex shader
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);

    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vs));
      return false;
    }

    // Compile fragment shader
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fs));
      return false;
    }

    // Create program
    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(this.program));
      return false;
    }

    gl.useProgram(this.program);

    // Get uniform locations
    this.uniforms = {
      time: gl.getUniformLocation(this.program, 'u_time'),
      resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      mouse: gl.getUniformLocation(this.program, 'u_mouse'),
      mouseInfluence: gl.getUniformLocation(this.program, 'u_mouseInfluence')
    };

    console.log('LiquidGlass: Shaders compiled successfully');
    return true;
  }

  setupGeometry() {
    const gl = this.gl;

    // Full-screen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);

    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0
    ]);

    // Position buffer
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Texture coordinate buffer
    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texLoc = gl.getAttribLocation(this.program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const rect = this.container.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setupEvents() {
    // Resize handler
    const resizeHandler = () => this.resize();
    window.addEventListener('resize', resizeHandler);

    // Mouse handlers - update target position (will be smoothly interpolated)
    const mouseMoveHandler = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.targetMouse.x = (e.clientX - rect.left) / rect.width;
      this.targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    const mouseEnterHandler = () => {
      this.isHovering = true;
      this.targetMouseInfluence = 1.0;
    };

    const mouseLeaveHandler = () => {
      this.isHovering = false;
      this.targetMouseInfluence = 0.0;
    };

    // Use the parent section for mouse events (larger hit area)
    const heroSection = this.container.closest('section') || this.container;

    heroSection.addEventListener('mousemove', mouseMoveHandler);
    heroSection.addEventListener('mouseenter', mouseEnterHandler);
    heroSection.addEventListener('mouseleave', mouseLeaveHandler);

    // Store for cleanup
    this.cleanup = () => {
      window.removeEventListener('resize', resizeHandler);
      heroSection.removeEventListener('mousemove', mouseMoveHandler);
      heroSection.removeEventListener('mouseenter', mouseEnterHandler);
      heroSection.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }

  // Smooth lerp function
  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  animate() {
    const gl = this.gl;

    // Update time
    const time = (Date.now() - this.startTime) / 1000;

    // Smooth mouse position interpolation (very gentle, 2% per frame)
    this.mouse.x = this.lerp(this.mouse.x, this.targetMouse.x, 0.02);
    this.mouse.y = this.lerp(this.mouse.y, this.targetMouse.y, 0.02);

    // Smooth mouse influence (gentle fade in/out, 1.5% per frame)
    this.mouseInfluence = this.lerp(this.mouseInfluence, this.targetMouseInfluence, 0.015);

    // Set uniforms
    gl.uniform1f(this.uniforms.time, time);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.mouse, this.mouse.x, this.mouse.y);
    gl.uniform1f(this.uniforms.mouseInfluence, this.mouseInfluence);

    // Clear and draw
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.cleanup) {
      this.cleanup();
    }
    if (this.canvas) {
      this.canvas.remove();
    }
  }
}

// Initialize liquid glass effect
export function initLiquidGlass() {
  const heroSection = document.querySelector('section.min-h-screen');
  if (!heroSection) {
    console.warn('LiquidGlass: Hero section not found');
    return null;
  }

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('LiquidGlass: Reduced motion preferred, skipping');
    return null;
  }

  // Check for mobile (disable on small screens for performance)
  if (window.innerWidth < 768) {
    console.log('LiquidGlass: Mobile device, skipping for performance');
    return null;
  }

  // Remove old CSS-based background elements
  const oldContainer = heroSection.querySelector('.hero-goo-container');
  if (oldContainer) {
    oldContainer.style.display = 'none';
  }

  // Create new WebGL container
  const glContainer = document.createElement('div');
  glContainer.className = 'liquid-glass-container';
  glContainer.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  `;
  heroSection.insertBefore(glContainer, heroSection.firstChild);

  console.log('LiquidGlass: Initializing WebGL effect');
  return new LiquidGlass(glContainer);
}

export default LiquidGlass;
