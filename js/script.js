// ══════════════════════════════════════════════════════════════════════════════
// FORGE DISTRO v2 — Module Orchestrator
// ═══════════════════════════════════════════════════════════════════════════════
// Central bootstrap — imports and initializes all modules in the correct order.
//
// Initialization order:
//   1. initAnimations()  — page entry, nav scroll, feature card stagger, scroll-spy
//   2. initDrawer()      — mobile navigation drawer
//   3. initTerminal()    — typewriter animation / interactive terminal
//   4. requestIdleCallback → initParticles() (lazy-loaded, network-sensitive)
//   5. loadReleaseData() → on success: populateRelease, populateChangelog,
//      populateStats, __forgeTerminal.setData → on error: propagate error
//
// Trust hierarchy enforced in data pipeline:
//   1. Version truth    (version badge, header)    — updated first
//   2. Download truth   (CTA href, file size)      — updated second
//   3. Checksum truth   (SHA-256 display)          — updated third
//   4. Changelog truth  (accordion)                — updated fourth
//   5. Decorative telemetry (stats counters)       — updated last
// ══════════════════════════════════════════════════════════════════════════════

// ── Module imports ─────────────────────────────────────────────────────────────
import { loadReleaseData }  from './api.js';
import { populateRelease, showReleaseSkeleton } from './release.js';
import { populateChangelog, showChangelogSkeleton } from './changelog.js';
import { populateStats, initStats } from './stats.js';
import { initTerminal }     from './terminal.js';
import { initDrawer }       from './drawer.js';
import { initAnimations }   from './animations.js';
import { initParticles }    from './particles.js';

// ══════════════════════════════════════════════════════════════════════════════
//  FONT ACTIVATION
// ══════════════════════════════════════════════════════════════════════════════

// Activate Google Fonts stylesheet from preload (CSP-compliant — no inline handler)
(function activateFonts() {
  const preload = document.getElementById('gfonts-preload');
  if (preload) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = preload.href;
    document.head.appendChild(link);
  }
})();

// ══════════════════════════════════════════════════════════════════════════════
//  JS-ENABLED FLAG
// ══════════════════════════════════════════════════════════════════════════════

// Add js-enabled class to <html> for CSS hooks
document.documentElement.classList.add('js-enabled');

// ══════════════════════════════════════════════════════════════════════════════
//  DATA PIPELINE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch release data and propagate to all dynamic surfaces.
 * Trust hierarchy: version → download → checksum → changelog → stats
 */
async function initDataPipeline() {
  // Show skeleton loading states before fetch begins
  showReleaseSkeleton();
  showChangelogSkeleton();

  // Initialize stats observer early (so it's ready when data arrives)
  initStats();

  try {
    const { latest, releases } = await loadReleaseData();

    // ── Trust hierarchy: populate in order ────────────────────────────────
    // 1–3. Version truth, Download truth, Checksum truth
    populateRelease(latest, null);

    // 4. Changelog truth
    populateChangelog(releases, null);

    // 5. Decorative telemetry
    populateStats(latest, null);

    // Feed terminal
    if (window.__forgeTerminal && window.__forgeTerminal.setData) {
      window.__forgeTerminal.setData(latest);
    }

  } catch (err) {
    // Propagate error to all dynamic surfaces
    populateRelease(null, err);
    populateChangelog(null, err);
    populateStats(null, err);

    // Signal terminal
    if (window.__forgeTerminal && window.__forgeTerminal.setError) {
      window.__forgeTerminal.setError();
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  BOOTSTRAP
// ══════════════════════════════════════════════════════════════════════════════

function bootstrap() {
  // ── 1. Animations (page entry, nav scroll, feature cards, scroll-spy) ───
  initAnimations();

  // ── 2. Mobile nav drawer ────────────────────────────────────────────────
  initDrawer();

  // ── 3. Terminal (typewriter + interactive) ──────────────────────────────
  initTerminal();

  // ── 4. Particle canvas (lazy-loaded) ────────────────────────────────────
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => initParticles(), { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(initParticles, 2000);
  }

  // ── 5. Data pipeline (API fetch → populate surfaces) ────────────────────
  initDataPipeline();

  // ── Hero entry animation ────────────────────────────────────────────────
  // CSS has .js-enabled .hero-copy > * at opacity:0 and .terminal-window at opacity:0
  // Adding .is-visible triggers the transition
  requestAnimationFrame(() => {
    const heroCopyChildren = document.querySelectorAll('.hero-copy > *');
    heroCopyChildren.forEach((el) => el.classList.add('is-visible'));

    const terminalWindow = document.querySelector('.terminal-window');
    if (terminalWindow) terminalWindow.classList.add('is-visible');
  });

  console.log('[forge] All modules initialized');
}

// ── DOMContentLoaded guard ─────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
