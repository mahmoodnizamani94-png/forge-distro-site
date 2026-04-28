// ══════════════════════════════════════════════════════════════════════════════
// FORGE DISTRO v2 — Animations Module
// ═══════════════════════════════════════════════════════════════════════════════
// Page entry animations, nav scroll behavior, feature card stagger,
// scroll-spy, back-to-top, gallery wiring, built-by population, star count,
// download confirmation, cursor glow.
//
// Respects `prefers-reduced-motion: reduce` — all motion skipped.
// ══════════════════════════════════════════════════════════════════════════════

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ══════════════════════════════════════════════════════════════════════════════
//  NAV SCROLL BEHAVIOR
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Add `.nav--scrolled` class to header when scrollY > 48px.
 * Throttled via rAF to avoid layout thrashing.
 */
function initNavScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      if (window.scrollY > 48) {
        header.classList.add('nav--scrolled');
      } else {
        header.classList.remove('nav--scrolled');
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Set initial state
  onScroll();
}


// ══════════════════════════════════════════════════════════════════════════════
//  FEATURE CARD STAGGER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * IntersectionObserver triggers feature cards to animate in with stagger.
 * Each card animates once. CSS handles the actual animation via `.is-visible`.
 */
function initFeatureCardStagger() {
  const cards = document.querySelectorAll('.feature-card');
  if (!cards.length) return;

  // With reduced motion, CSS forces all cards visible — skip JS
  if (REDUCED_MOTION) {
    cards.forEach(card => card.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
}


// ══════════════════════════════════════════════════════════════════════════════
//  SCROLL-SPY
// ══════════════════════════════════════════════════════════════════════════════

/**
 * IntersectionObserver on all `section[id]` elements.
 * Updates `.is-active` class on corresponding nav links.
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  // Build a map from section ID to nav link(s)
  const linkMap = new Map();
  navLinks.forEach(link => {
    const hash = link.getAttribute('href');
    if (hash && hash.startsWith('#')) {
      const id = hash.slice(1);
      if (!linkMap.has(id)) linkMap.set(id, []);
      linkMap.get(id).push(link);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const links = linkMap.get(id);
      if (!links) return;

      if (entry.isIntersecting) {
        // Deactivate all nav links
        navLinks.forEach(l => l.classList.remove('is-active'));
        // Activate this section's links
        links.forEach(l => l.classList.add('is-active'));
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0,
  });

  sections.forEach(section => observer.observe(section));
}


// ══════════════════════════════════════════════════════════════════════════════
//  BACK-TO-TOP BUTTON
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Show back-to-top button when scrollY > 150vh.
 * Smooth scroll to top on click. Respects reduced motion.
 */
function initBackToTop() {
  const btn = document.getElementById('scroll-to-top');
  if (!btn) return;

  const threshold = window.innerHeight * 1.5; // 150vh
  let ticking = false;

  function updateVisibility() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      if (window.scrollY > threshold) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: REDUCED_MOTION ? 'auto' : 'smooth',
    });
  });
}


// ══════════════════════════════════════════════════════════════════════════════
//  GALLERY WIRING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Gallery image lazy-loading with IntersectionObserver.
 * onerror → swap to placeholder panel with "SCREENSHOT PENDING" label.
 * HUD overlay opacity increase on hover (handled by CSS).
 */
function initGallery() {
  const panels = document.querySelectorAll('.gallery-panel');
  if (!panels.length) return;

  // Define screenshot sources
  const screenshots = [
    { src: 'screenshots/screen-01.webp', alt: 'Forge OTA Lab - Analysis screen showing OTA package classification' },
    { src: 'screenshots/screen-02.webp', alt: 'Forge OTA Lab - Extraction screen showing partition extraction progress' },
    { src: 'screenshots/screen-03.webp', alt: 'Forge OTA Lab - Results screen showing extracted partition images' },
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const panel = entry.target;
      const index = Array.from(panels).indexOf(panel);
      const screenshotData = screenshots[index];
      if (!screenshotData) return;

      // Check if image already loaded or attempted
      if (panel.dataset.loaded) return;
      panel.dataset.loaded = 'true';

      const img = document.createElement('img');
      img.alt = screenshotData.alt;
      img.loading = 'lazy';
      img.width = 1080;
      img.height = 2340;

      img.addEventListener('load', () => {
        // Remove placeholder, insert image before overlay
        const placeholder = panel.querySelector('.gallery-placeholder');
        if (placeholder) placeholder.remove();
        // Insert before the HUD overlay so overlay stays on top
        const overlay = panel.querySelector('.gallery-hud-overlay');
        if (overlay) {
          panel.insertBefore(img, overlay);
        } else {
          panel.appendChild(img);
        }
      });

      img.addEventListener('error', () => {
        // Ensure placeholder remains visible with "SCREENSHOT PENDING"
        const placeholder = panel.querySelector('.gallery-placeholder');
        if (placeholder) {
          const label = placeholder.querySelector('.gallery-placeholder-label');
          if (label) label.textContent = 'Screenshot Pending';
        }
      });

      // Trigger load — Image() loads off-DOM, no inline styles needed
      img.src = screenshotData.src;

      observer.unobserve(panel);
    });
  }, { threshold: 0.1 });

  panels.forEach(panel => observer.observe(panel));
}


// ══════════════════════════════════════════════════════════════════════════════
//  BUILT BY SECTION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Read `forge:dev-*` meta tags and populate Built By section.
 * Missing meta tags → section shows tech stack only.
 * Links get `rel="noopener noreferrer"` and `target="_blank"`.
 */
function initBuiltBy() {
  const getMeta = (name) => {
    const el = document.querySelector(`meta[name="${name}"]`);
    if (!el) return null;
    const content = el.getAttribute('content');
    // Check for placeholder values like {DEV_NAME}
    if (!content || /^\{.+\}$/.test(content)) return null;
    return content.trim();
  };

  const devName    = getMeta('forge:dev-name');
  const devTagline = getMeta('forge:dev-tagline');
  const devUrl     = getMeta('forge:dev-url');
  const devGithub  = getMeta('forge:dev-github');
  const devLinkedin = getMeta('forge:dev-linkedin');

  const identityEl = document.getElementById('built-by-identity');
  const nameEl     = document.getElementById('built-by-name');
  const taglineEl  = document.getElementById('built-by-tagline');
  const linksEl    = document.getElementById('built-by-links');

  // If no dev name, hide the identity container entirely
  if (!devName) {
    if (identityEl) identityEl.style.display = 'none';
    return;
  }

  // Populate name
  if (nameEl) nameEl.textContent = devName;
  if (taglineEl) {
    if (devTagline) {
      taglineEl.textContent = devTagline;
    } else {
      taglineEl.style.display = 'none';
    }
  }

  // Populate social links
  if (linksEl) {
    const links = [];

    if (devUrl) {
      links.push({ href: devUrl, text: 'Portfolio' });
    }
    if (devGithub) {
      links.push({ href: devGithub, text: 'GitHub' });
    }
    if (devLinkedin) {
      links.push({ href: devLinkedin, text: 'LinkedIn' });
    }

    if (links.length > 0) {
      const fragment = document.createDocumentFragment();
      links.forEach(linkData => {
        const a = document.createElement('a');
        a.href = linkData.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = linkData.text;
        fragment.appendChild(a);
      });
      linksEl.appendChild(fragment);
    }
  }
}


// ══════════════════════════════════════════════════════════════════════════════
//  GITHUB STAR COUNT
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch stargazers_count from GitHub API and display in footer Star CTA.
 * Cached in sessionStorage.
 */
async function initStarCount() {
  const cta = document.querySelector('.star-github-cta');
  if (!cta) return;

  const STAR_CACHE_KEY = 'forge-star-count';
  const STAR_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Check cache
  try {
    const raw = sessionStorage.getItem(STAR_CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached && cached.timestamp && Date.now() - cached.timestamp < STAR_CACHE_TTL) {
        cta.textContent = `★ Star on GitHub (${formatCount(cached.count)})`;
        return;
      }
    }
  } catch { /* ignore */ }

  // Read repo meta
  try {
    const ownerEl = document.querySelector('meta[name="forge:repo-owner"]');
    const repoEl  = document.querySelector('meta[name="forge:repo-name"]');
    const owner = ownerEl ? ownerEl.getAttribute('content') : null;
    const repo  = repoEl  ? repoEl.getAttribute('content')  : null;

    if (!owner || !repo || /^\{.+\}$/.test(owner) || /^\{.+\}$/.test(repo)) return;

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 'Accept': 'application/vnd.github+json' },
    });

    if (!response.ok) return;

    const data = await response.json();
    const count = data.stargazers_count;

    if (typeof count === 'number') {
      cta.textContent = `★ Star on GitHub (${formatCount(count)})`;
      try {
        sessionStorage.setItem(STAR_CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          count,
        }));
      } catch { /* ignore */ }
    }
  } catch {
    // Silently fail — star count is purely decorative
    console.warn('[forge] Star count fetch failed.');
  }
}

/**
 * Format a number with commas for readability.
 * @param {number} n
 * @returns {string}
 */
function formatCount(n) {
  if (typeof n !== 'number') return '0';
  return n.toLocaleString('en-US');
}


// ══════════════════════════════════════════════════════════════════════════════
//  DOWNLOAD CONFIRMATION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * On download CTA click → show "Download started ✓" confirmation
 * with processing animation (dots cycling for 800ms).
 */
function initDownloadConfirmation() {
  const ctas = document.querySelectorAll('.download-cta');
  const container = document.getElementById('download-confirmation');
  const textEl    = document.getElementById('download-confirmation-text');

  if (!container || !textEl || !ctas.length) return;

  ctas.forEach(cta => {
    cta.addEventListener('click', () => {
      // Add loading state to button
      cta.classList.add('is-loading');

      // Show processing state
      container.removeAttribute('hidden');
      container.classList.remove('is-success');
      textEl.textContent = 'Starting download';

      // Dot cycling animation
      let dots = 0;
      const dotInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        textEl.textContent = 'Starting download' + '.'.repeat(dots);
      }, 200);

      // Show success after 800ms
      setTimeout(() => {
        clearInterval(dotInterval);
        textEl.textContent = 'Download started ✓';
        container.classList.add('is-success');
        cta.classList.remove('is-loading');

        // Hide after 3 seconds
        setTimeout(() => {
          container.setAttribute('hidden', '');
          container.classList.remove('is-success');
        }, 3000);
      }, 800);
    });
  });
}


// ══════════════════════════════════════════════════════════════════════════════
//  CURSOR GLOW ON CARDS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Applies a radial gradient glow that follows the cursor on glass cards.
 * Uses CSS custom property `--glow-angle` for the conic gradient.
 */
function initCursorGlow() {
  if (REDUCED_MOTION) return;

  const cards = document.querySelectorAll('.glass-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
      card.style.setProperty('--glow-angle', `${angle}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--glow-angle');
    });
  });
}


// ══════════════════════════════════════════════════════════════════════════════
//  PAGE ENTRY ANIMATIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Hero elements fade-in-up with 80ms stagger, 500ms duration.
 * Skipped if prefers-reduced-motion.
 * Note: script.js already handles the .is-visible class addition.
 * This function handles additional entry animation concerns.
 */
function initPageEntry() {
  if (REDUCED_MOTION) {
    // Force everything visible immediately
    const heroCopyChildren = document.querySelectorAll('.hero-copy > *');
    heroCopyChildren.forEach(el => el.classList.add('is-visible'));

    const terminalWindow = document.querySelector('.terminal-window');
    if (terminalWindow) terminalWindow.classList.add('is-visible');

    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => card.classList.add('is-visible'));

    const versionBadge = document.querySelector('.version-badge');
    if (versionBadge) versionBadge.classList.add('is-visible');

    // Force-show all reveal sections
    const revealSections = document.querySelectorAll('.section-reveal');
    revealSections.forEach(s => s.classList.add('is-visible'));
  }
}


// ══════════════════════════════════════════════════════════════════════════════
//  SECTION SCROLL REVEAL
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Adds `.section-reveal` class to below-fold sections and reveals them
 * on scroll with IntersectionObserver. Hero and stats are excluded.
 */
function initScrollReveal() {
  const excludedSections = ['hero', 'stats'];
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  // Tag eligible sections with the CSS hook
  const revealTargets = [];
  sections.forEach(section => {
    if (!excludedSections.includes(section.id)) {
      section.classList.add('section-reveal');
      revealTargets.push(section);
    }
  });

  if (!revealTargets.length) return;

  // Reduced motion: force visible immediately
  if (REDUCED_MOTION) {
    revealTargets.forEach(s => s.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });

  revealTargets.forEach(s => observer.observe(s));

  // Also animate version badge when hero copy is visible
  const versionBadge = document.querySelector('.version-badge');
  if (versionBadge && !versionBadge.classList.contains('is-visible')) {
    // Version badge is in the hero — trigger it along with hero copy
    const heroCopy = document.querySelector('.hero-copy');
    if (heroCopy) {
      const badgeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            versionBadge.classList.add('is-visible');
            badgeObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      badgeObserver.observe(heroCopy);
    }
  }
}



// ══════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize all animations. Called first by orchestrator.
 */
export function initAnimations() {
  // Page entry
  initPageEntry();

  // Nav scroll behavior
  initNavScroll();

  // Feature card stagger (IntersectionObserver)
  initFeatureCardStagger();

  // Scroll-spy on nav links
  initScrollSpy();

  // Section scroll reveal (below-fold sections)
  initScrollReveal();

  // Back-to-top button
  initBackToTop();

  // Gallery wiring (lazy load, error handling)
  initGallery();

  // Built By section from meta tags
  initBuiltBy();

  // Star count (async, non-blocking)
  initStarCount();

  // Download confirmation
  initDownloadConfirmation();

  // Cursor glow on glass cards
  initCursorGlow();

  console.log('[forge] Animations module initialized');
}
