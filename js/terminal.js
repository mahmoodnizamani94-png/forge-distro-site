// ══════════════════════════════════════════════════════════════════════════════
// FORGE DISTRO v2 — Terminal Module
// ═══════════════════════════════════════════════════════════════════════════════
// Two modes:
//   1. Decorative (all viewports) — typewriter animation loop
//   2. Interactive (desktop ≥ 1024px) — command parser with response output
//
// API data flows in via window.__forgeTerminal.setData(data) from orchestrator.
// No innerHTML anywhere — all output via textContent or DOM creation.
// ══════════════════════════════════════════════════════════════════════════════

const DESKTOP_BREAKPOINT = 1024;
const MAX_HISTORY_LINES = 50;
const TYPEWRITER_SPEED = 28;      // ms per character
const LINE_REVEAL_DELAY = 80;     // ms between scan lines
const PROGRESS_DURATION = 1200;   // ms for 0→88%
const LOOP_PAUSE = 4000;          // ms before restart

// ── Terminal content — matches PRD FR-8 exactly ────────────────────────────
const TERMINAL_SCRIPT = [
  { type: 'command', text: '$ forge analyze pixel-9p-march-2026-ota.zip' },
  { type: 'scan', text: '► FORMAT        payload.bin (A/B Full OTA)' },
  { type: 'scan', text: '► DEVICE        Pixel 9 Pro - BP1A.250305.019' },
  { type: 'scan', text: '► SECURITY      2026-03-05' },
  { type: 'scan', text: '► TIER          SUPPORTED' },
  { type: 'scan', text: '► PARTITIONS    34 detected (6 extractable)' },
  { type: 'pause', duration: 200 },
  { type: 'command', text: '$ forge extract boot.img init_boot.img' },
  { type: 'progress', text: '⋮ [{bar}] {pct}% - boot.img', duration: PROGRESS_DURATION },
  { type: 'pause', duration: 150 },
  { type: 'result', text: '✓ boot.img         SHA-256 verified  [31.4 MB]' },
  { type: 'result', text: '✓ init_boot.img    SHA-256 verified  [ 8.1 MB]' },
  { type: 'separator', text: '─' },
  { type: 'ready', text: 'Ready. 2 artifacts exported to /storage/OTA/' },
];

// ── State ──────────────────────────────────────────────────────────────────
let terminalBody = null;
let terminalInput = null;
let terminalInputLine = null;
let terminalWindow = null;
let downloadCta = null;

let isAnimating = false;
let isInteractive = false;
let isTerminalVisible = true;
let animationAbortController = null;
let apiData = null;
let apiError = false;
let visibilityObserver = null;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ══════════════════════════════════════════════════════════════════════════════
//  UTILITY
// ══════════════════════════════════════════════════════════════════════════════

/** Cancellable delay using AbortSignal */
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    }
  });
}

/** Check if viewport ≥ 1024px */
function isDesktop() {
  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

/** Create a text line div and append to terminal body */
function createLine(text, className) {
  const line = document.createElement('div');
  if (className) line.className = className;
  line.textContent = text;
  terminalBody.appendChild(line);
  trimHistory();
  scrollToBottom();
  return line;
}

/** Trim history to MAX_HISTORY_LINES */
function trimHistory() {
  while (terminalBody.children.length > MAX_HISTORY_LINES) {
    terminalBody.removeChild(terminalBody.firstChild);
  }
}

/** Auto-scroll terminal to bottom */
function scrollToBottom() {
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

// ══════════════════════════════════════════════════════════════════════════════
//  DECORATIVE MODE — Typewriter Animation
// ══════════════════════════════════════════════════════════════════════════════

/** Render static final state (reduced-motion or no-JS fallback) */
function renderStaticState() {
  clearTerminalBody();
  for (const item of TERMINAL_SCRIPT) {
    if (item.type === 'pause') continue;
    if (item.type === 'progress') {
      // Show final progress state
      const bar = '█'.repeat(20) + '░'.repeat(3);
      const text = item.text.replace('{bar}', bar).replace('{pct}', '88');
      createLine(text);
    } else if (item.type === 'separator') {
      createLine(item.text);
    } else {
      createLine(item.text);
    }
  }
}

/** Typewriter effect for a command line */
async function typewriterLine(text, signal) {
  const line = document.createElement('div');
  terminalBody.appendChild(line);
  trimHistory();

  for (let i = 0; i < text.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    line.textContent = text.slice(0, i + 1);
    scrollToBottom();
    await delay(TYPEWRITER_SPEED, signal);
  }
  return line;
}

/** Instant reveal for scan/result lines */
async function instantLine(text, delayMs, signal) {
  await delay(delayMs, signal);
  return createLine(text);
}

/** Progress bar animation */
async function animateProgress(item, signal) {
  const line = document.createElement('div');
  terminalBody.appendChild(line);
  trimHistory();

  const totalChars = 23; // total bar width
  const targetPct = 88;
  const steps = 30;
  const stepDuration = item.duration / steps;

  for (let i = 0; i <= steps; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const pct = Math.round((targetPct / steps) * i);
    const filled = Math.round((totalChars / steps) * i * (20 / totalChars));
    const empty = totalChars - filled;
    const bar = '█'.repeat(Math.min(filled, 20)) + '░'.repeat(Math.max(totalChars - Math.min(filled, 20), 0));
    line.textContent = item.text.replace('{bar}', bar).replace('{pct}', String(pct));
    scrollToBottom();
    if (i < steps) await delay(stepDuration, signal);
  }
  // Final state
  const finalBar = '█'.repeat(20) + '░'.repeat(3);
  line.textContent = item.text.replace('{bar}', finalBar).replace('{pct}', '88');
}

/** Clear terminal body content */
function clearTerminalBody() {
  // Remove all child nodes — never use innerHTML
  while (terminalBody.firstChild) {
    terminalBody.removeChild(terminalBody.firstChild);
  }
}

/** Run the full animation sequence */
async function runAnimationLoop(signal) {
  isAnimating = true;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (signal.aborted) break;
    clearTerminalBody();

    for (const item of TERMINAL_SCRIPT) {
      if (signal.aborted) break;

      switch (item.type) {
        case 'command':
          await typewriterLine(item.text, signal);
          break;
        case 'scan':
          await instantLine(item.text, LINE_REVEAL_DELAY, signal);
          break;
        case 'pause':
          await delay(item.duration, signal);
          break;
        case 'progress':
          await animateProgress(item, signal);
          break;
        case 'result':
          await instantLine(item.text, 100, signal);
          break;
        case 'separator':
          await instantLine(item.text, 150, signal);
          break;
        case 'ready':
          await instantLine(item.text, 200, signal);
          break;
      }
    }

    // Pause before loop restart
    await delay(LOOP_PAUSE, signal);
  }
}

/** Start the decorative animation */
function startAnimation() {
  if (prefersReducedMotion.matches) {
    renderStaticState();
    return;
  }

  stopAnimation();
  animationAbortController = new AbortController();

  runAnimationLoop(animationAbortController.signal).catch((err) => {
    if (err.name !== 'AbortError') {
      console.error('[forge] Terminal animation error:', err);
    }
  }).finally(() => {
    isAnimating = false;
  });
}

/** Stop the decorative animation cleanly */
function stopAnimation() {
  if (animationAbortController) {
    animationAbortController.abort();
    animationAbortController = null;
  }
  isAnimating = false;
}

/** Pause the animation when the terminal scrolls out of view.
 *  Resume when it scrolls back into view. This eliminates
 *  the DOM mutations (appendChild/removeChild/textContent)
 *  that cause layout recalculation and visible page shake. */
function initVisibilityObserver() {
  if (!('IntersectionObserver' in window) || !terminalWindow) return;

  // Generous rootMargin: keep animating a bit beyond the viewport edge
  // so there's no visible "pop" when scrolling back to the terminal.
  visibilityObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      isTerminalVisible = entry.isIntersecting;

      if (isInteractive) continue; // Interactive mode manages its own lifecycle

      if (isTerminalVisible && !isAnimating) {
        startAnimation();
      } else if (!isTerminalVisible && isAnimating) {
        stopAnimation();
        // Render static final state so the terminal looks correct
        // if the user prints the page or inspects off-screen DOM.
        renderStaticState();
      }
    }
  }, {
    // Extend detection 200px beyond viewport — avoids visible
    // animation restart as the terminal enters the viewport.
    rootMargin: '200px 0px',
    threshold: 0,
  });

  visibilityObserver.observe(terminalWindow);
}

// ══════════════════════════════════════════════════════════════════════════════
//  INTERACTIVE MODE — Desktop only (≥ 1024px)
// ══════════════════════════════════════════════════════════════════════════════

/** Read meta tag content by name */
function readMeta(name) {
  const el = document.querySelector(`meta[name="${name}"]`);
  return el ? el.getAttribute('content') : null;
}

/** Get the GitHub repo URL from meta tags */
function getRepoUrl() {
  const owner = readMeta('forge:repo-owner');
  const repo = readMeta('forge:repo-name');
  if (owner && repo && owner !== '{OWNER}' && repo !== '{REPO}') {
    return `https://github.com/${owner}/${repo}`;
  }
  return null;
}

/** Build help text */
function getHelpText() {
  return [
    'Available commands:',
    '',
    '  help       - Show this help message',
    '  version    - Current app version and release date',
    '  download   - Download the latest APK',
    '  changelog  - Show latest changelog entry',
    '  about      - About the developer',
    '  clear      - Clear terminal output',
    '  repo       - Open GitHub repository',
    '  hash       - Show SHA-256 hash of latest release',
  ].join('\n');
}

/** Build version response */
function getVersionText() {
  if (!apiData) {
    return 'Data not available. Visit GitHub Releases.';
  }
  const version = apiData.tag_name || 'unknown';
  const date = apiData.published_at
    ? new Date(apiData.published_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : 'unknown';
  return `Forge OTA Lab ${version}\nReleased: ${date}`;
}

/** Build changelog response */
function getChangelogText() {
  if (!apiData) {
    return 'Data not available. Visit GitHub Releases.';
  }
  const version = apiData.tag_name || 'unknown';
  const body = apiData.body
    ? apiData.body.replace(/[#*_`~\[\]]/g, '').trim()
    : 'No changelog provided.';
  // Truncate if very long
  const truncated = body.length > 500 ? body.slice(0, 497) + '...' : body;
  return `${version} changelog:\n\n${truncated}`;
}

/** Build about response from meta tags */
function getAboutText() {
  const name = readMeta('forge:dev-name') || 'Unknown';
  const tagline = readMeta('forge:dev-tagline') || '';

  const lines = [];
  if (name && name !== '{DEV_NAME}') {
    lines.push(name);
  }
  if (tagline && tagline !== '{DEV_TAGLINE}') {
    lines.push(tagline);
  }
  lines.push('');
  lines.push('Built with: Vanilla HTML/CSS/JS, OKLCH Color Science,');
  lines.push('WCAG 2.2 AA, GitHub API, Canvas Particles, Glassmorphism.');
  return lines.join('\n');
}

/** Build hash response */
function getHashText() {
  if (!apiData) {
    return 'Data not available. Visit GitHub Releases.';
  }
  if (!apiData._hash) {
    return 'No SHA-256 hash found in this release.';
  }
  return `SHA-256:\n${apiData._hash}`;
}

/** Command lookup table — strict matching, no eval, no dynamic execution */
const COMMANDS = {
  help() { return getHelpText(); },
  version() { return getVersionText(); },
  download() {
    if (!apiData) {
      return 'Data not available. Visit GitHub Releases.';
    }
    // Trigger download CTA click
    if (downloadCta) {
      setTimeout(() => downloadCta.click(), 100);
    }
    return 'Initiating download…';
  },
  changelog() { return getChangelogText(); },
  about() { return getAboutText(); },
  clear() { return null; }, // handled specially
  repo() {
    const url = getRepoUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return `Opening ${url}…`;
    }
    return 'Repository URL not configured.';
  },
  hash() { return getHashText(); },
};

/** Enter interactive mode */
function enterInteractiveMode() {
  if (isInteractive) return;
  isInteractive = true;

  // Stop any running animation
  stopAnimation();

  // Update ARIA for interactive mode
  terminalWindow.setAttribute('role', 'application');
  terminalWindow.setAttribute('aria-label', 'Interactive Forge terminal');
  terminalWindow.removeAttribute('aria-hidden');

  // Clear and show welcome
  clearTerminalBody();
  createLine('Welcome to Forge OTA Lab terminal.', 'terminal-response');
  createLine("Type 'help' for available commands.", 'terminal-response');
  createLine('', '');

  // Focus input
  if (terminalInput) {
    terminalInput.focus();
  }
}

/** Exit interactive mode (ESC) */
function exitInteractiveMode() {
  if (!isInteractive) return;
  isInteractive = false;

  // Restore ARIA
  terminalWindow.setAttribute('role', 'img');
  terminalWindow.setAttribute('aria-label', 'Terminal demonstration showing Forge OTA Lab analyzing an OTA package');

  // Blur input
  if (terminalInput) {
    terminalInput.blur();
  }

  // Restart animation
  startAnimation();
}

/** Process a submitted command */
function processCommand(rawInput) {
  const cmd = rawInput.trim().toLowerCase();

  // Show the command as a prompt line
  createLine(`$ ${rawInput.trim()}`, '');

  if (cmd === '') {
    // Empty enter — just a new prompt line
    return;
  }

  // Log for debugging (PRD requirement)
  console.log(`[forge] Terminal: command '${cmd}' executed`);

  if (cmd === 'clear') {
    clearTerminalBody();
    return;
  }

  const handler = COMMANDS[cmd];
  if (handler) {
    const response = handler();
    if (response !== null && response !== undefined) {
      createLine(response, 'terminal-response');
    }
  } else {
    createLine(`Command not found: '${cmd}'. Type 'help' for available commands.`, 'terminal-response');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  EVENT WIRING
// ══════════════════════════════════════════════════════════════════════════════

function wireInteractiveEvents() {
  // Input submit on Enter
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processCommand(terminalInput.value);
      terminalInput.value = '';
    }

    // ESC blurs input and returns focus to download CTA
    if (e.key === 'Escape') {
      e.preventDefault();
      terminalInput.blur();
      if (downloadCta) {
        downloadCta.focus();
      }
    }
  });

  // Click terminal window to enter interactive mode
  terminalWindow.addEventListener('click', () => {
    // Don't interfere with input focus if already interactive
    if (isInteractive) {
      terminalInput.focus();
      return;
    }
    enterInteractiveMode();
  });

  // Keyboard interaction — if user types while terminal is in viewport,
  // enter interactive mode
  terminalWindow.addEventListener('keydown', (e) => {
    if (!isInteractive && e.key.length === 1) {
      enterInteractiveMode();
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  GLOBAL API — window.__forgeTerminal
// ══════════════════════════════════════════════════════════════════════════════

window.__forgeTerminal = {
  /** Receive API data from orchestrator */
  setData(data) {
    apiData = data;
    console.log('[forge] Terminal: API data received');
  },

  /** Signal API error */
  setError() {
    apiError = true;
    console.log('[forge] Terminal: API error signaled');
  },
};

// ══════════════════════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════════════════════

export function initTerminal() {
  terminalBody   = document.getElementById('terminal-body');
  terminalInput  = document.getElementById('terminal-input');
  terminalInputLine = document.getElementById('terminal-input-line');
  terminalWindow = document.getElementById('terminal-window') || document.querySelector('.terminal-window');
  downloadCta    = document.getElementById('download-cta');

  if (!terminalBody || !terminalWindow) {
    console.warn('[forge] Terminal: required DOM elements not found');
    return;
  }

  // Viewport-based ARIA: mobile → decorative (aria-hidden),
  // desktop → accessible (role="img" until interactive activation)
  updateTerminalAria();

  // Set aria-live on terminal body for screen reader announcements
  terminalBody.setAttribute('aria-live', 'assertive');

  // Remove static content from HTML (the pre/code block)
  // We'll render it dynamically
  const codeBlock = terminalBody.querySelector('code');
  if (codeBlock) {
    terminalBody.removeChild(codeBlock);
  }

  // Wire interactive events if input element exists
  if (terminalInput) {
    wireInteractiveEvents();
  }

  // Listen for reduced-motion changes
  prefersReducedMotion.addEventListener('change', () => {
    if (isInteractive) return; // Don't interrupt interactive mode
    if (prefersReducedMotion.matches) {
      stopAnimation();
      renderStaticState();
    } else {
      startAnimation();
    }
  });

  // Listen for viewport changes to update ARIA
  const desktopMq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
  desktopMq.addEventListener('change', () => {
    if (!isInteractive) updateTerminalAria();
  });

  // Start animation (visibility observer will control pause/resume)
  initVisibilityObserver();

  // Kick off initial animation only if terminal is actually visible.
  // The observer will start it if the terminal enters the viewport later.
  if (isTerminalVisible) {
    startAnimation();
  }

  console.log('[forge] Terminal: initialized');
}

/**
 * Set ARIA attributes based on viewport width.
 * Mobile: decorative only → hide from AT.
 * Desktop: accessible as a static image → role="img" with label.
 */
function updateTerminalAria() {
  if (window.innerWidth < DESKTOP_BREAKPOINT) {
    terminalWindow.setAttribute('aria-hidden', 'true');
    terminalWindow.removeAttribute('role');
    terminalWindow.removeAttribute('aria-label');
  } else {
    terminalWindow.removeAttribute('aria-hidden');
    terminalWindow.setAttribute('role', 'img');
    terminalWindow.setAttribute('aria-label', 'Terminal demonstration showing Forge OTA Lab analyzing an OTA package');
  }
}
