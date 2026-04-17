// ══════════════════════════════════════════════════════════════════════════════
// FORGE DISTRO v2 — Particle Canvas Module
// ═══════════════════════════════════════════════════════════════════════════════
// 2D particle/star field with depth variation, copper tint, mouse repulsion,
// pulsing particles, glow effects, and comprehensive pause/skip conditions.
//
// Skip conditions:
//   - prefers-reduced-motion: reduce
//   - navigator.connection.saveData
//   - navigator.connection.effectiveType === '2g'
//   - viewport width < 320px
//
// Pause conditions:
//   - Tab hidden (visibilitychange)
//   - Scrolled past 120vh
//   - Canvas context errors
//
// Performance: 30fps throttle via timestamp comparison.
// ══════════════════════════════════════════════════════════════════════════════

// ── Constants ──────────────────────────────────────────────────────────────────
const PARTICLE_COUNT_DESKTOP = 60;
const PARTICLE_COUNT_MOBILE  = 30;
const DESKTOP_BREAKPOINT     = 768;
const MIN_VIEWPORT           = 320;
const SCROLL_HIDE_THRESHOLD  = 1.2; // 120vh
const MOUSE_REPEL_RADIUS     = 100;
const MOUSE_REPEL_STRENGTH   = 0.8;
const PULSE_PERCENTAGE       = 0.05; // 5% of particles pulse
const FRONT_DEPTH_THRESHOLD  = 0.7;
const FRAME_INTERVAL         = 1000 / 30; // ~33ms for 30fps
const RESIZE_DEBOUNCE        = 200;

// Copper tint — approximation of oklch(0.62 0.145 38) at varying alpha
const COPPER_R = 160;
const COPPER_G = 100;
const COPPER_B = 48;


// ══════════════════════════════════════════════════════════════════════════════
//  PARTICLE CLASS
// ══════════════════════════════════════════════════════════════════════════════

class Particle {
  /**
   * @param {number} canvasW - Canvas width
   * @param {number} canvasH - Canvas height
   * @param {boolean} isPulsing - Whether this particle pulses alpha
   */
  constructor(canvasW, canvasH, isPulsing = false) {
    this.reset(canvasW, canvasH, true);
    this.isPulsing = isPulsing;
    this.pulseOffset = Math.random() * Math.PI * 2;
  }

  /**
   * Reset particle to random position (or bottom if respawning).
   * @param {number} canvasW
   * @param {number} canvasH
   * @param {boolean} randomY - If true, random Y; else, spawn at bottom
   */
  reset(canvasW, canvasH, randomY = false) {
    this.x = Math.random() * canvasW;
    this.y = randomY ? Math.random() * canvasH : canvasH + Math.random() * 20;
    this.depth = Math.random(); // 0–1

    // Depth-driven properties
    this.size   = 1 + this.depth * 2;    // 1–3px
    this.alpha  = 0.2 + this.depth * 0.4; // 0.2–0.6
    this.speed  = 0.1 + this.depth * 0.2; // 0.1–0.3 px/frame

    // Horizontal wobble parameters
    this.wobbleAmplitude = 0.3 + Math.random() * 0.5;
    this.wobbleFrequency = 0.002 + Math.random() * 0.003;
    this.wobblePhase = Math.random() * Math.PI * 2;
  }

  /**
   * Update particle position for one frame.
   * @param {number} time - Current timestamp
   * @param {number} canvasW
   * @param {number} canvasH
   * @param {number} mouseX - Mouse X (-1 if no mouse)
   * @param {number} mouseY - Mouse Y (-1 if no mouse)
   * @param {boolean} isDesktop - Whether mouse repulsion applies
   */
  update(time, canvasW, canvasH, mouseX, mouseY, isDesktop) {
    // Drift upward
    this.y -= this.speed;

    // Horizontal wobble via sine wave
    this.x += Math.sin(time * this.wobbleFrequency + this.wobblePhase) * this.wobbleAmplitude;

    // Mouse repulsion (desktop only)
    if (isDesktop && mouseX >= 0 && mouseY >= 0) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_REPEL_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_REPEL_RADIUS) * MOUSE_REPEL_STRENGTH;
        this.x += (dx / dist) * force;
        this.y += (dy / dist) * force;
      }
    }

    // Respawn at bottom when exiting top
    if (this.y < -10) {
      this.reset(canvasW, canvasH, false);
    }

    // Wrap horizontal
    if (this.x < -10) this.x = canvasW + 10;
    if (this.x > canvasW + 10) this.x = -10;
  }

  /**
   * Compute current alpha (with pulsing if applicable).
   * @param {number} time
   * @returns {number}
   */
  getAlpha(time) {
    if (this.isPulsing) {
      const pulse = Math.sin(time * 0.003 + this.pulseOffset) * 0.5 + 0.5;
      return this.alpha * (0.5 + pulse * 0.5);
    }
    return this.alpha;
  }
}


// ══════════════════════════════════════════════════════════════════════════════
//  PARTICLE SYSTEM
// ══════════════════════════════════════════════════════════════════════════════

class ParticleSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.lastFrameTime = 0;
    this.mouseX = -1;
    this.mouseY = -1;
    this.isDesktop = false;
    this.isPaused = false;
    this.isDestroyed = false;
    this.resizeTimeout = null;
  }

  /**
   * Initialize the particle system.
   * @returns {boolean} True if initialized successfully
   */
  init() {
    // ── Skip conditions ──────────────────────────────────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('[forge] Particles skipped: prefers-reduced-motion');
      return false;
    }

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      if (conn.saveData) {
        console.log('[forge] Particles skipped: saveData enabled');
        return false;
      }
      if (conn.effectiveType === '2g') {
        console.log('[forge] Particles skipped: 2g connection');
        return false;
      }
    }

    if (window.innerWidth < MIN_VIEWPORT) {
      console.log('[forge] Particles skipped: viewport < 320px');
      return false;
    }

    // ── Canvas setup ─────────────────────────────────────────────────────
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) {
      console.warn('[forge] Particle canvas element not found');
      return false;
    }

    try {
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) throw new Error('Canvas 2D context null');
    } catch (err) {
      console.warn('[forge] Canvas context error:', err.message);
      return false;
    }

    // Ensure canvas attributes
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.pointerEvents = 'none';

    // Size canvas
    this.resize();

    // ── Determine particle count ─────────────────────────────────────────
    this.isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    const count = this.isDesktop ? PARTICLE_COUNT_DESKTOP : PARTICLE_COUNT_MOBILE;

    // ── Create particles ─────────────────────────────────────────────────
    this.particles = [];
    const pulseCount = Math.max(1, Math.floor(count * PULSE_PERCENTAGE));

    for (let i = 0; i < count; i++) {
      const isPulsing = i < pulseCount;
      this.particles.push(new Particle(this.canvas.width, this.canvas.height, isPulsing));
    }

    // ── Event listeners ──────────────────────────────────────────────────
    this._onResize = this._handleResize.bind(this);
    this._onVisChange = this._handleVisibilityChange.bind(this);
    this._onScroll = this._handleScroll.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseLeave = this._handleMouseLeave.bind(this);

    window.addEventListener('resize', this._onResize, { passive: true });
    document.addEventListener('visibilitychange', this._onVisChange);
    window.addEventListener('scroll', this._onScroll, { passive: true });

    if (this.isDesktop) {
      window.addEventListener('mousemove', this._onMouseMove, { passive: true });
      window.addEventListener('mouseleave', this._onMouseLeave, { passive: true });
    }

    // ── Start loop ───────────────────────────────────────────────────────
    this.lastFrameTime = performance.now();
    this._loop(this.lastFrameTime);

    console.log(`[forge] Particle system initialized: ${count} particles`);
    return true;
  }


  // ── RESIZE ───────────────────────────────────────────────────────────────

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width  = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width  = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    if (this.ctx) this.ctx.scale(dpr, dpr);
  }

  _handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.resize();
      this.isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    }, RESIZE_DEBOUNCE);
  }


  // ── VISIBILITY ───────────────────────────────────────────────────────────

  _handleVisibilityChange() {
    if (document.hidden) {
      this.isPaused = true;
    } else {
      this.isPaused = false;
      this.lastFrameTime = performance.now();
      if (!this.isDestroyed) this._loop(this.lastFrameTime);
    }
  }


  // ── SCROLL ───────────────────────────────────────────────────────────────

  _handleScroll() {
    const scrollThreshold = window.innerHeight * SCROLL_HIDE_THRESHOLD;
    if (window.scrollY > scrollThreshold) {
      if (!this.isPaused) {
        this.isPaused = true;
      }
    } else {
      if (this.isPaused && !document.hidden) {
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this._loop(this.lastFrameTime);
      }
    }
  }


  // ── MOUSE ────────────────────────────────────────────────────────────────

  _handleMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  _handleMouseLeave() {
    this.mouseX = -1;
    this.mouseY = -1;
  }


  // ── RENDER LOOP ──────────────────────────────────────────────────────────

  _loop(timestamp) {
    if (this.isPaused || this.isDestroyed) return;

    this.animationId = requestAnimationFrame((ts) => this._loop(ts));

    // 30fps throttle
    const elapsed = timestamp - this.lastFrameTime;
    if (elapsed < FRAME_INTERVAL) return;
    this.lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

    try {
      this._render(timestamp);
    } catch (err) {
      console.warn('[forge] Canvas render error — disabling particles:', err.message);
      this.destroy();
    }
  }

  _render(time) {
    const ctx = this.ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update
      p.update(time, w, h, this.mouseX, this.mouseY, this.isDesktop);

      // Current alpha
      const alpha = p.getAlpha(time);

      // Glow effect for front particles and pulsing particles
      const shouldGlow = p.depth > FRONT_DEPTH_THRESHOLD || p.isPulsing;

      if (shouldGlow) {
        // Radial gradient glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `rgba(${COPPER_R}, ${COPPER_G}, ${COPPER_B}, ${alpha * 0.6})`);
        gradient.addColorStop(0.5, `rgba(${COPPER_R}, ${COPPER_G}, ${COPPER_B}, ${alpha * 0.15})`);
        gradient.addColorStop(1, `rgba(${COPPER_R}, ${COPPER_G}, ${COPPER_B}, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Core particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COPPER_R}, ${COPPER_G}, ${COPPER_B}, ${alpha})`;
      ctx.fill();
    }
  }


  // ── CLEANUP ──────────────────────────────────────────────────────────────

  destroy() {
    this.isDestroyed = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    clearTimeout(this.resizeTimeout);

    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVisChange);
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseleave', this._onMouseLeave);

    // Clear canvas
    if (this.ctx && this.canvas) {
      try {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      } catch { /* ignore */ }
    }

    this.particles = [];
    console.log('[forge] Particle system destroyed');
  }
}


// ══════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════

let system = null;

/**
 * Initialize the particle canvas system.
 * Called by orchestrator via requestIdleCallback (lazy-loaded).
 */
export function initParticles() {
  try {
    system = new ParticleSystem();
    const success = system.init();
    if (!success) {
      system = null;
    }
  } catch (err) {
    console.warn('[forge] Particle system init error:', err.message);
    if (system) {
      try { system.destroy(); } catch { /* ignore */ }
    }
    system = null;
  }
}
