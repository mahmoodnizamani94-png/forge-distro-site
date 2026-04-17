// ══════════════════════════════════════════════════════════════════════════════
// FORGE DISTRO v2 — Stats Strip Module
// ═══════════════════════════════════════════════════════════════════════════════
// Populates the 4 stat blocks in the stats strip:
//   1. Total downloads (counter-animated on scroll)
//   2. Latest version (text)
//   3. Android target (static: "10+")
//   4. License (static: "GPL-3.0")
//
// Counter animation:
//   - 0 → value over 1500ms
//   - cubic-bezier(0.16, 1, 0.3, 1) easing via requestAnimationFrame
//   - Triggered by IntersectionObserver (threshold: 0.3)
//   - prefers-reduced-motion → instant
//   - saveData / 2g → instant
//   - Number formatting: comma-separated or X.XM
// ══════════════════════════════════════════════════════════════════════════════

const COUNTER_DURATION = 1500; // ms

// ── DOM references ─────────────────────────────────────────────────────────────
let statDownloads = null;
let statVersion   = null;
let statAndroid   = null;
let statLicense   = null;
let statsSection  = null;

// ── State ──────────────────────────────────────────────────────────────────────
let downloadTarget = 0;
let hasAnimated = false;
let observer = null;
let apiDataReady = false;

// ══════════════════════════════════════════════════════════════════════════════
//  UTILITY
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Check if reduced motion is preferred.
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if saveData or 2g connection is detected.
 * @returns {boolean}
 */
function isLowBandwidth() {
  if (typeof navigator === 'undefined') return false;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return false;
  if (conn.saveData) return true;
  if (conn.effectiveType === '2g') return true;
  return false;
}

/**
 * Check if counter animation should be skipped.
 * @returns {boolean}
 */
function shouldSkipAnimation() {
  return prefersReducedMotion() || isLowBandwidth();
}

/**
 * Format a number for display.
 * < 1M: comma-separated (e.g. "12,345")
 * >= 1M: "X.XM" (e.g. "1.2M")
 * @param {number} value
 * @returns {string}
 */
function formatNumber(value) {
  if (typeof value !== 'number' || value < 0) return '-';
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  return Math.round(value).toLocaleString('en-US');
}

// ══════════════════════════════════════════════════════════════════════════════
//  EASING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Approximate cubic-bezier(0.16, 1, 0.3, 1) easing.
 * This is an "ease-out-expo" style curve — fast at the start, slow deceleration.
 * @param {number} t - Progress from 0 to 1
 * @returns {number} Eased value from 0 to 1
 */
function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// ══════════════════════════════════════════════════════════════════════════════
//  COUNTER ANIMATION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Animate a counter from 0 to target value.
 * @param {HTMLElement} element - The element to update
 * @param {number} target - Target value
 */
function animateCounter(element, target) {
  if (!element || typeof target !== 'number' || target <= 0) {
    if (element) element.textContent = formatNumber(target || 0);
    return;
  }

  // Skip animation: instant display
  if (shouldSkipAnimation()) {
    element.textContent = formatNumber(target);
    return;
  }

  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / COUNTER_DURATION, 1);
    const easedProgress = easeOutExpo(progress);
    const current = Math.round(easedProgress * target);

    element.textContent = formatNumber(current);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Ensure final value is exact
      element.textContent = formatNumber(target);
    }
  }

  requestAnimationFrame(step);
}

// ══════════════════════════════════════════════════════════════════════════════
//  INTERSECTION OBSERVER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Start observing the stats section for viewport entry.
 * When visible (threshold 0.3), trigger counter animation.
 */
function startObserving() {
  if (!statsSection || !('IntersectionObserver' in window)) {
    // Fallback: show instantly
    if (apiDataReady) showInstant();
    return;
  }

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && !hasAnimated && apiDataReady) {
        hasAnimated = true;
        runAnimation();
        observer.unobserve(statsSection);
      }
    }
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}

/**
 * Run the counter animation (called when stats are visible and data is ready).
 */
function runAnimation() {
  animateCounter(statDownloads, downloadTarget);
}

/**
 * Show values instantly (no animation).
 */
function showInstant() {
  if (statDownloads) statDownloads.textContent = formatNumber(downloadTarget);
  hasAnimated = true;
}

// ══════════════════════════════════════════════════════════════════════════════
//  ERROR STATE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Show error state on dynamic stats (downloads, version).
 * Static stats (Android, License) remain unchanged.
 */
function showError() {
  if (statDownloads) statDownloads.textContent = '-';
  if (statVersion)   statVersion.textContent = '-';
  // Static stats unchanged
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Populate the stats strip.
 * Called by orchestrator with latest release data or error.
 *
 * @param {object|null} latest - Enriched latest release from api.js, or null on error
 * @param {Error|null}  error  - Typed error, or null on success
 */
export function populateStats(latest, error) {
  // Cache DOM
  statDownloads = document.getElementById('stat-downloads');
  statVersion   = document.getElementById('stat-version');
  statAndroid   = document.getElementById('stat-android');
  statLicense   = document.getElementById('stat-license');
  statsSection  = document.getElementById('stats');

  if (error || !latest) {
    showError();
    return;
  }

  // ── Populate dynamic stats ──────────────────────────────────────────────
  downloadTarget = latest._downloads || 0;
  apiDataReady = true;

  // Version — plain text, no animation
  if (statVersion) {
    statVersion.textContent = latest.tag_name || '-';
  }

  // Static stats — already correct in HTML, but ensure they're set
  if (statAndroid) statAndroid.textContent = '10+';
  if (statLicense) statLicense.textContent = 'GPL-3.0';

  // ── Counter animation setup ─────────────────────────────────────────────
  // If already observed and visible, animate now
  if (hasAnimated) {
    // Stats were already visible before data arrived — show instantly
    showInstant();
  } else if (observer) {
    // Observer already running, will pick up data when visible
    // But check if stats are already visible right now
    const rect = statsSection ? statsSection.getBoundingClientRect() : null;
    if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
      hasAnimated = true;
      runAnimation();
      if (observer && statsSection) observer.unobserve(statsSection);
    }
  } else {
    // Start observing
    startObserving();
  }
}

/**
 * Initialize the stats strip observer.
 * Called early by orchestrator so the observer is ready before API data arrives.
 */
export function initStats() {
  statDownloads = document.getElementById('stat-downloads');
  statVersion   = document.getElementById('stat-version');
  statsSection  = document.getElementById('stats');

  // Start observing immediately so it's ready when data arrives
  startObserving();
}
