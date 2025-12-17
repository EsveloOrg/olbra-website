/**
 * Liquid Glass Bubbles - WebGL Raymarching Effect
 * Creates interactive purple glass spheres with refraction and chromatic aberration
 * Using OGL.js for minimal WebGL abstraction
 */

import { Renderer, Program, Mesh, Triangle } from 'ogl';

// Vertex shader - simple fullscreen triangle
const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fragment shader - Frozen glass ribbon with subtle mouse light interaction
const fragment = /* glsl */ `
  precision mediump float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;

  #define PI 3.14159265359

  // Simple noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Flowing ribbon shape
  float ribbonShape(vec2 p, float t) {
    // Main flowing curve
    float curve = sin(p.x * 0.7 + t * 0.25) * 0.5;
    curve += sin(p.x * 0.35 - t * 0.15) * 0.7;
    curve += cos(p.x * 1.0 + p.y * 0.2 + t * 0.2) * 0.25;

    // Distance from ribbon center
    float ribbonCenter = curve;
    float distFromCenter = abs(p.y - ribbonCenter);

    // Ribbon width with variation
    float ribbonWidth = 0.9 + sin(p.x * 0.4 + t * 0.15) * 0.35;

    // Sharp edge falloff
    float ribbon = 1.0 - smoothstep(ribbonWidth * 0.6, ribbonWidth, distFromCenter);

    return ribbon;
  }

  // Height for 3D effect
  float ribbonHeight(vec2 p, float t) {
    float shape = ribbonShape(p, t);
    float height = shape * (0.6 + 0.25 * sin(p.x * 0.5 + t * 0.12));
    height *= 1.0 + 0.1 * noise(p * 1.5 + t * 0.08);
    return height;
  }

  // Surface normal
  vec3 calcNormal(vec2 p, float t) {
    vec2 e = vec2(0.015, 0.0);
    float h = ribbonHeight(p, t);
    float hx = ribbonHeight(p + e.xy, t);
    float hy = ribbonHeight(p + e.yx, t);
    return normalize(vec3((h - hx) * 2.0, (h - hy) * 2.0, 0.12));
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.4;

    // Aspect correction
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect * 3.2;

    // === WHITE BACKGROUND ===
    vec3 background = vec3(1.0);

    // Get glass shape
    float shape = ribbonShape(p, t);
    float h = ribbonHeight(p, t);

    // === SUBTLE BLUE CAUSTIC/SHADOW ===
    vec2 causticOffset = vec2(0.1, -0.15);
    float causticShape = ribbonShape(p + causticOffset, t);
    float caustic = causticShape * 0.3;
    caustic *= smoothstep(0.0, 0.6, causticShape);
    caustic *= (1.0 - smoothstep(0.0, 0.3, shape));

    // Light blue tint for caustic
    vec3 causticColor = vec3(0.88, 0.94, 1.0);

    // Background with subtle caustic
    vec3 col = mix(background, causticColor, caustic * 0.2);

    if (shape > 0.1) {
      vec3 n = calcNormal(p, t);
      vec3 viewDir = vec3(0.0, 0.0, 1.0);

      // Fresnel
      float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 2.5);

      // === LIGHT BLUE FROZEN GLASS ===
      float colorVar = sin(p.x * 1.5 + p.y * 0.8 + t * 0.2) * 0.5 + 0.5;
      vec3 tint1 = vec3(0.92, 0.96, 1.0);   // Bright ice blue
      vec3 tint2 = vec3(0.95, 0.97, 1.0);   // Almost white
      vec3 glassColor = mix(tint1, tint2, colorVar);

      // === SPECULAR HIGHLIGHTS with mouse-driven light shift ===
      // Mouse offset for light position (subtle, centered at 0.5)
      vec2 mouseOffset = (uMouse - 0.5) * uMouseInfluence * 0.6;

      // Primary light - shifts with mouse
      vec3 lightDir1 = normalize(vec3(0.4 + mouseOffset.x, 0.7 + mouseOffset.y, 1.0));
      vec3 reflectDir1 = reflect(-lightDir1, n);
      float spec1 = pow(max(dot(viewDir, reflectDir1), 0.0), 96.0);

      // Secondary light - shifts opposite to mouse for depth
      vec3 lightDir2 = normalize(vec3(-0.5 - mouseOffset.x * 0.5, 0.5 - mouseOffset.y * 0.3, 0.9));
      vec3 reflectDir2 = reflect(-lightDir2, n);
      float spec2 = pow(max(dot(viewDir, reflectDir2), 0.0), 64.0);

      // Third light - subtle mouse influence
      vec3 lightDir3 = normalize(vec3(0.6 + mouseOffset.x * 0.3, -0.3 + mouseOffset.y * 0.2, 0.8));
      vec3 reflectDir3 = reflect(-lightDir3, n);
      float spec3 = pow(max(dot(viewDir, reflectDir3), 0.0), 48.0);

      // Animated highlight with mouse modulation
      vec3 lightDir4 = normalize(vec3(
        sin(t * 0.3) * 0.4 + mouseOffset.x * 0.4,
        cos(t * 0.25) * 0.3 + mouseOffset.y * 0.4,
        1.0
      ));
      vec3 reflectDir4 = reflect(-lightDir4, n);
      float spec4 = pow(max(dot(viewDir, reflectDir4), 0.0), 80.0);

      // Edge factor
      float edgeFactor = 1.0 - smoothstep(0.1, 0.6, shape);

      // === COMBINE GLASS ===
      col = glassColor;

      // Subtle depth
      col = mix(col, col * 0.98, h * 0.05);

      // Edge highlight
      col = mix(col, vec3(0.97, 0.98, 1.0), edgeFactor * 0.4);

      // Fresnel rim
      col = mix(col, vec3(1.0), fresnel * 0.35);

      // Specular highlights
      col += vec3(1.0) * spec1 * 0.9;
      col += vec3(0.95, 0.98, 1.0) * spec2 * 0.5;
      col += vec3(1.0, 0.98, 0.96) * spec3 * 0.35;
      col += vec3(0.92, 0.96, 1.0) * spec4 * 0.25;

      // === CHROMATIC ABERRATION / RAINBOW ===
      // Edge rainbow (stronger at fresnel edges)
      float edgeRainbow = fresnel * edgeFactor;

      // Interior chromatic dispersion based on normal angle
      float dispersionAngle = atan(n.y, n.x);
      float dispersion = abs(n.x * n.y) * 0.8; // Stronger where normal bends

      // Combine edge and interior chromatic effects
      float chromaStrength = edgeRainbow * 1.2 + dispersion * shape * 0.4;

      // Rainbow color separation with smooth gradient
      float rainbowPhase = dispersionAngle * 2.0 + p.x * 0.8 + t * 0.3;
      col.r += chromaStrength * 0.08 * sin(rainbowPhase);
      col.g += chromaStrength * 0.06 * sin(rainbowPhase + PI * 0.66);
      col.b += chromaStrength * 0.10 * sin(rainbowPhase + PI * 1.33);

      // Additional subtle prismatic highlight following specular
      float prism = spec1 * 0.15 + spec2 * 0.1;
      col.r += prism * sin(n.x * 8.0 + t * 0.4) * 0.06;
      col.g += prism * sin(n.x * 8.0 + t * 0.4 + 2.1) * 0.05;
      col.b += prism * sin(n.x * 8.0 + t * 0.4 + 4.2) * 0.07;

      // Blend with background
      float alpha = smoothstep(0.1, 0.25, shape);
      col = mix(background, col, alpha * 0.9);
    }

    // Subtle vignette
    float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.15;
    col *= vignette;

    col = min(col, vec3(1.0));

    // Bottom fade to white - smooth gradient mask
    float bottomFade = smoothstep(0.0, 0.25, uv.y);
    col = mix(vec3(1.0), col, bottomFade);

    gl_FragColor = vec4(col, 1.0);
  }
`;

class LiquidGlassBubbles {
  constructor(container) {
    this.container = container;
    this.renderer = null;
    this.program = null;
    this.mesh = null;
    this.animationId = null;
    this.startTime = Date.now();
    this.mouse = { x: 0.5, y: 0.5 };
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.mouseInfluence = 0;
    this.targetMouseInfluence = 0;

    this.init();
  }

  init() {
    // Create OGL renderer
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2)
    });

    const gl = this.renderer.gl;
    this.container.appendChild(gl.canvas);

    // Style canvas
    gl.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;

    // Create fullscreen triangle geometry (more efficient than quad)
    const geometry = new Triangle(gl);

    // Create program with shaders
    this.program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uMouse: { value: [0.5, 0.5] },
        uMouseInfluence: { value: 0 }
      }
    });

    // Create mesh
    this.mesh = new Mesh(gl, { geometry, program: this.program });

    // Setup events
    this.resize();
    this.setupEvents();
    this.animate();

    console.log('LiquidGlassBubbles: Initialized');
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);

    this.program.uniforms.uResolution.value = [
      this.renderer.gl.canvas.width,
      this.renderer.gl.canvas.height
    ];
  }

  setupEvents() {
    // Resize handler
    const resizeHandler = () => this.resize();
    window.addEventListener('resize', resizeHandler);

    // Mouse handlers
    const heroSection = this.container.closest('section') || this.container;

    const mouseMoveHandler = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.targetMouse.x = (e.clientX - rect.left) / rect.width;
      this.targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    const mouseEnterHandler = () => {
      this.targetMouseInfluence = 1.0;
    };

    const mouseLeaveHandler = () => {
      this.targetMouseInfluence = 0.0;
    };

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

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  animate() {
    // Update time
    const time = (Date.now() - this.startTime) / 1000;

    // Smooth mouse interpolation
    this.mouse.x = this.lerp(this.mouse.x, this.targetMouse.x, 0.03);
    this.mouse.y = this.lerp(this.mouse.y, this.targetMouse.y, 0.03);
    this.mouseInfluence = this.lerp(this.mouseInfluence, this.targetMouseInfluence, 0.02);

    // Update uniforms
    this.program.uniforms.uTime.value = time;
    this.program.uniforms.uMouse.value = [this.mouse.x, this.mouse.y];
    this.program.uniforms.uMouseInfluence.value = this.mouseInfluence;

    // Render
    this.renderer.render({ scene: this.mesh });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.cleanup) {
      this.cleanup();
    }
    if (this.renderer?.gl?.canvas) {
      this.renderer.gl.canvas.remove();
    }
  }
}

// Initialize liquid glass bubbles effect
export function initLiquidGlassBubbles() {
  const heroSection = document.querySelector('section.min-h-screen');
  if (!heroSection) {
    console.warn('LiquidGlassBubbles: Hero section not found');
    return null;
  }

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    console.log('LiquidGlassBubbles: Reduced motion preferred, skipping');
    return null;
  }

  // Check for mobile (disable on small screens for performance)
  if (window.innerWidth < 768) {
    console.log('LiquidGlassBubbles: Mobile device, skipping for performance');
    return null;
  }

  // Remove old CSS-based background elements
  const oldContainer = heroSection.querySelector('.hero-goo-container');
  if (oldContainer) {
    oldContainer.style.display = 'none';
  }

  // Remove old WebGL container if exists
  const oldGlContainer = heroSection.querySelector('.liquid-glass-container');
  if (oldGlContainer) {
    oldGlContainer.remove();
  }

  // Create new WebGL container
  const glContainer = document.createElement('div');
  glContainer.className = 'liquid-glass-bubbles-container';
  glContainer.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  `;
  heroSection.insertBefore(glContainer, heroSection.firstChild);

  console.log('LiquidGlassBubbles: Initializing WebGL effect');
  return new LiquidGlassBubbles(glContainer);
}

export default LiquidGlassBubbles;
