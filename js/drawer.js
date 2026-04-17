// ══════════════════════════════════════════════════════════════════════════════
// FORGE DISTRO v2 — Mobile Navigation Drawer Module
// ═══════════════════════════════════════════════════════════════════════════════
// Slide-in drawer from right with:
//   - Focus trap (Tab/Shift+Tab cycle within drawer)
//   - ESC close
//   - Backdrop click close
//   - Body scroll lock
//   - ARIA state management
//   - Hamburger ↔ X animation via CSS class toggle
//   - prefers-reduced-motion: instant transitions
//   - Debounced rapid toggle protection
// ══════════════════════════════════════════════════════════════════════════════

// ── State ──────────────────────────────────────────────────────────────────
let hamburgerBtn = null;
let drawer = null;
let backdrop = null;

let isOpen = false;
let isTransitioning = false;

const TRANSITION_DURATION = 250; // matches CSS 250ms

// ══════════════════════════════════════════════════════════════════════════════
//  FOCUS TRAP
// ══════════════════════════════════════════════════════════════════════════════

/** Get all focusable elements within the drawer */
function getFocusableElements() {
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(drawer.querySelectorAll(selector));
}

/** Handle Tab/Shift+Tab to trap focus inside drawer */
function handleFocusTrap(e) {
  if (e.key !== 'Tab') return;

  const focusable = getFocusableElements();
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey) {
    // Shift+Tab — if on first element, wrap to last
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    // Tab — if on last element, wrap to first
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  OPEN / CLOSE
// ══════════════════════════════════════════════════════════════════════════════

/** Open the drawer */
function openDrawer() {
  if (isOpen || isTransitioning) return;
  isTransitioning = true;

  isOpen = true;

  // Update ARIA
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  hamburgerBtn.setAttribute('aria-label', 'Close navigation menu');

  // Show backdrop and drawer
  backdrop.classList.add('is-open');
  drawer.classList.add('is-open');

  // Lock body scroll
  document.body.style.overflow = 'hidden';

  // Wire focus trap and keyboard events
  document.addEventListener('keydown', handleDrawerKeydown);

  // Focus first focusable element in drawer after transition
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const focusDelay = reducedMotion ? 10 : TRANSITION_DURATION;

  setTimeout(() => {
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }
    isTransitioning = false;
  }, focusDelay);
}

/** Close the drawer */
function closeDrawer(returnFocus = true) {
  if (!isOpen || isTransitioning) return;
  isTransitioning = true;

  isOpen = false;

  // Update ARIA
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');

  // Hide backdrop and drawer
  backdrop.classList.remove('is-open');
  drawer.classList.remove('is-open');

  // Unlock body scroll
  document.body.style.overflow = '';

  // Remove keyboard listener
  document.removeEventListener('keydown', handleDrawerKeydown);

  // Return focus to hamburger after transition
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const focusDelay = reducedMotion ? 10 : TRANSITION_DURATION;

  setTimeout(() => {
    if (returnFocus) {
      hamburgerBtn.focus();
    }
    isTransitioning = false;
  }, focusDelay);
}

/** Toggle drawer state */
function toggleDrawer() {
  if (isOpen) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  KEYBOARD HANDLING
// ══════════════════════════════════════════════════════════════════════════════

/** Handle keyboard events while drawer is open */
function handleDrawerKeydown(e) {
  // ESC closes drawer
  if (e.key === 'Escape') {
    e.preventDefault();
    closeDrawer();
    return;
  }

  // Focus trap
  handleFocusTrap(e);
}

// ══════════════════════════════════════════════════════════════════════════════
//  SMOOTH SCROLL FOR NAV LINKS
// ══════════════════════════════════════════════════════════════════════════════

/** Handle nav link click — close drawer, scroll to section */
function handleNavLinkClick(e) {
  const target = e.currentTarget;
  const href = target.getAttribute('href');

  // Only handle internal anchor links
  if (!href || !href.startsWith('#')) return;

  e.preventDefault();

  // Close drawer (don't return focus to hamburger since we're scrolling)
  closeDrawer(false);

  // Scroll to section after drawer closes
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollDelay = reducedMotion ? 10 : TRANSITION_DURATION + 50;

  setTimeout(() => {
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      // Set focus to the section for accessibility
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }
  }, scrollDelay);
}

// ══════════════════════════════════════════════════════════════════════════════
//  EVENT WIRING
// ══════════════════════════════════════════════════════════════════════════════

function wireEvents() {
  // Hamburger click
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer();
  });

  // Backdrop click
  backdrop.addEventListener('click', () => {
    closeDrawer();
  });

  // Wire nav links inside drawer
  const navLinks = drawer.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener('click', handleNavLinkClick);
  });

  // Handle window resize — close drawer if viewport exceeds mobile
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // If drawer is open but we've resized to tablet/desktop (≥ 640px),
      // close it since hamburger is hidden at that breakpoint
      if (isOpen && window.innerWidth >= 640) {
        // Force close without transition concerns
        isTransitioning = false;
        closeDrawer(false);
      }
    }, 200);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════════════════════

export function initDrawer() {
  hamburgerBtn = document.getElementById('hamburger-btn');
  drawer       = document.getElementById('nav-drawer');
  backdrop     = document.getElementById('nav-drawer-backdrop');

  if (!hamburgerBtn || !drawer || !backdrop) {
    console.warn('[forge] Drawer: required DOM elements not found');
    return;
  }

  // Ensure correct initial ARIA state
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');

  // Wire all events
  wireEvents();

  console.log('[forge] Drawer: initialized');
}
